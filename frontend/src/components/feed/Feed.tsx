import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { canCreateFeedPost, canPinFeedPost, groupStories } from './feedUtils';
import {
  createFeedPost,
  createFeedStory,
  listFeedPosts,
  listFeedStories,
  markFeedStoryAsViewed,
  reactToFeedPost,
  setFeedPostPinned
} from '../../services/feed';
import type { CreatePostPayload, CreateStoryPayload, FeedResponse, FeedStory, ReactionEmoji } from '../../types/feed';
import { CreateContentButton, CreateContentModal } from './CreateContentModal';
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
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number>();
  const canCreate = canCreateFeedPost(user?.cargo);
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
      if (!viewStoryMutation.isPending) {
        viewStoryMutation.mutate(storyId);
      }
    },
    [viewStoryMutation]
  );

  return (
    <section aria-label="Feed social" className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy">Feed</h2>
          <p className="text-sm text-slate-500">Novidades da comunidade escolar.</p>
        </div>
        {canCreate ? <CreateContentButton onClick={() => setIsCreateOpen(true)} /> : null}
      </div>
      <StoriesBar groups={storyGroups} isLoading={storiesQuery.isLoading} onOpen={setViewerGroupIndex} />
      {feedQuery.isLoading ? <LoadingFeed /> : null}
      {feedQuery.isError ? <FeedError /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? <EmptyFeed /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              canPin={canPin}
              isPinning={pinningPostId === post.id}
              isReacting={reactingPostId === post.id}
              key={post.id}
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
          onClose={() => setViewerGroupIndex(undefined)}
          onView={handleViewStory}
        />
      ) : null}
    </section>
  );
}
