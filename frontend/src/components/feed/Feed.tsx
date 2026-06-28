import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { canCreateFeedPost, canDeleteFeedPost, canDeleteFeedStory, canPinFeedPost, groupStories } from './feedUtils';
import {
  createFeedPost,
  createFeedStory,
  deleteFeedPost,
  deleteFeedStory,
  listFeedPosts,
  listFeedStories,
  markFeedStoryAsViewed,
  reactToFeedPost,
  setFeedPostPinned
} from '../../services/feed';
import type { CreatePostPayload, CreateStoryPayload, FeedResponse, FeedStory, ReactionEmoji } from '../../types/feed';
import { CreateContentButton, CreateContentModal } from './CreateContentModal';
import { DeletePostDialog } from './DeletePostDialog';
import { EmptyFeed } from './EmptyFeed';
import { LoadingFeed } from './LoadingFeed';
import { PostCard } from './PostCard';
import { StoriesBar } from './StoriesBar';
import { StoryViewer } from './StoryViewer';

const feedQueryKey = ['feed', 'posts'] as const;
const storiesQueryKey = ['feed', 'stories'] as const;

function FeedError() {
  return (
    <section className="rounded-[1.75rem] border border-red-100 bg-red-50/90 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-brand-navy">Nao foi possivel carregar as publicacoes.</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Tente novamente em alguns instantes.</p>
        </div>
      </div>
    </section>
  );
}

export function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reactingPostId, setReactingPostId] = useState<string>();
  const [pinningPostId, setPinningPostId] = useState<string>();
  const [postToDeleteId, setPostToDeleteId] = useState<string>();
  const [deletingStoryId, setDeletingStoryId] = useState<string>();
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number>();
  const canCreate = canCreateFeedPost(user?.cargo, user ?? undefined);
  const canPin = canPinFeedPost(user?.cargo);

  const feedQuery = useQuery({
    queryKey: feedQueryKey,
    queryFn: () => listFeedPosts({ limit: 10, page: 1 })
  });

  const storiesQuery = useQuery({
    queryKey: storiesQueryKey,
    queryFn: listFeedStories
  });

  const createPostMutation = useMutation({
    mutationFn: createFeedPost,
    onError: () => setCreateError('Nao foi possivel publicar agora.'),
    onMutate: () => setCreateError(undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feedQueryKey });
    }
  });

  const createStoryMutation = useMutation({
    mutationFn: createFeedStory,
    onError: () => setCreateError('Nao foi possivel publicar agora.'),
    onMutate: () => setCreateError(undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: storiesQueryKey });
    }
  });

  const reactionMutation = useMutation({
    mutationFn: ({ emoji, postId }: { emoji: ReactionEmoji; postId: string }) => reactToFeedPost(postId, emoji),
    onMutate: ({ postId }) => setReactingPostId(postId),
    onSettled: () => setReactingPostId(undefined),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<FeedResponse>(feedQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          publicacoes: current.publicacoes.map((post) => (post.id === updatedPost.id ? updatedPost : post))
        };
      });
    }
  });

  const pinMutation = useMutation({
    mutationFn: ({ pinned, postId }: { pinned: boolean; postId: string }) => setFeedPostPinned(postId, pinned),
    onMutate: ({ postId }) => setPinningPostId(postId),
    onSettled: () => setPinningPostId(undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feedQueryKey });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeedPost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });
      const previousFeed = queryClient.getQueryData<FeedResponse>(feedQueryKey);

      queryClient.setQueryData<FeedResponse>(feedQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          publicacoes: current.publicacoes.filter((post) => post.id !== postId),
          paginacao: {
            ...current.paginacao,
            total: Math.max(current.paginacao.total - 1, 0)
          }
        };
      });

      setPostToDeleteId(undefined);

      return { previousFeed };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(feedQueryKey, context.previousFeed);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: feedQueryKey });
    }
  });

  const deleteStoryMutation = useMutation({
    mutationFn: deleteFeedStory,
    onMutate: async (storyId) => {
      setDeletingStoryId(storyId);
      await queryClient.cancelQueries({ queryKey: storiesQueryKey });
      const previousStories = queryClient.getQueryData<FeedStory[]>(storiesQueryKey);

      queryClient.setQueryData<FeedStory[]>(storiesQueryKey, (current) => current?.filter((story) => story.id !== storyId));

      return { previousStories };
    },
    onError: (_error, _storyId, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(storiesQueryKey, context.previousStories);
      }
    },
    onSettled: async () => {
      setDeletingStoryId(undefined);
      await queryClient.invalidateQueries({ queryKey: storiesQueryKey });
    }
  });

  const viewStoryMutation = useMutation({
    mutationFn: markFeedStoryAsViewed,
    onSuccess: (updatedStory) => {
      queryClient.setQueryData<FeedStory[]>(storiesQueryKey, (current) =>
        current?.map((story) => (story.id === updatedStory.id ? updatedStory : story))
      );
    }
  });

  const posts = useMemo(() => feedQuery.data?.publicacoes ?? [], [feedQuery.data?.publicacoes]);
  const storyGroups = useMemo(() => groupStories(storiesQuery.data ?? []), [storiesQuery.data]);

  const handleCreate = useCallback(
    async (payload: CreatePostPayload) => {
      await createPostMutation.mutateAsync(payload);
    },
    [createPostMutation]
  );

  const handleCreateStory = useCallback(
    async (payload: CreateStoryPayload) => {
      await createStoryMutation.mutateAsync(payload);
    },
    [createStoryMutation]
  );

  const handleReact = useCallback(
    (postId: string, emoji: ReactionEmoji) => {
      if (!reactionMutation.isPending) {
        reactionMutation.mutate({ postId, emoji });
      }
    },
    [reactionMutation]
  );

  const handlePin = useCallback(
    (postId: string, pinned: boolean) => {
      if (!pinMutation.isPending) {
        pinMutation.mutate({ postId, pinned });
      }
    },
    [pinMutation]
  );

  const handleViewStory = useCallback(
    (storyId: string) => {
      viewStoryMutation.mutate(storyId);
    },
    [viewStoryMutation]
  );

  const handleDeleteStory = useCallback(
    (storyId: string) => {
      const confirmed = window.confirm('Deseja realmente excluir este Story?');

      if (confirmed && !deleteStoryMutation.isPending) {
        deleteStoryMutation.mutate(storyId);
      }
    },
    [deleteStoryMutation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (postToDeleteId && !deleteMutation.isPending) {
      deleteMutation.mutate(postToDeleteId);
    }
  }, [deleteMutation, postToDeleteId]);

  return (
    <section aria-label="Feed social" className="mx-auto w-full max-w-5xl space-y-5">
      <StoriesBar groups={storyGroups} isLoading={storiesQuery.isLoading} onOpen={setViewerGroupIndex} />
      {canCreate ? (
        <div className="flex justify-end">
          <CreateContentButton onClick={() => setIsCreateOpen(true)} />
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-brand-navy sm:text-3xl">Feed</h1>
        <p className="mt-1 text-sm text-slate-500">Novidades, avisos e momentos da comunidade escolar.</p>
      </div>
      {feedQuery.isLoading ? <LoadingFeed /> : null}
      {feedQuery.isError ? <FeedError /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? <EmptyFeed /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              canDelete={canDeleteFeedPost(user?.id, user?.cargo, post.autor.id)}
              canPin={canPin}
              isDeleting={deleteMutation.isPending && postToDeleteId === post.id}
              isPinning={pinningPostId === post.id}
              isReacting={reactingPostId === post.id}
              key={post.id}
              onDelete={setPostToDeleteId}
              onPin={handlePin}
              onReact={handleReact}
              post={post}
            />
          ))}
        </div>
      ) : null}
      <CreateContentModal
        error={createError}
        isOpen={isCreateOpen}
        isSubmitting={createPostMutation.isPending || createStoryMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreatePost={handleCreate}
        onCreateStory={handleCreateStory}
      />
      {viewerGroupIndex !== undefined ? (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={viewerGroupIndex}
          canDeleteStory={(story) => canDeleteFeedStory(user?.id, user?.cargo, story.autor.id)}
          deletingStoryId={deletingStoryId}
          onClose={() => setViewerGroupIndex(undefined)}
          onDelete={handleDeleteStory}
          onView={handleViewStory}
        />
      ) : null}
      <DeletePostDialog
        isDeleting={deleteMutation.isPending}
        isOpen={Boolean(postToDeleteId)}
        onClose={() => setPostToDeleteId(undefined)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
