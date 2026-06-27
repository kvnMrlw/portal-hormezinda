import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { canCreateFeedPost } from './feedUtils';
import { createFeedPost, likeFeedPost, listFeedPosts } from '../../services/feed';
import type { FeedResponse } from '../../types/feed';
import { CreatePost } from './CreatePost';
import { EmptyFeed } from './EmptyFeed';
import { LoadingFeed } from './LoadingFeed';
import { PostCard } from './PostCard';

const feedQueryKey = ['feed', 'posts'] as const;

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
  const [likingPostId, setLikingPostId] = useState<string>();
  const canCreate = canCreateFeedPost(user?.cargo);

  const feedQuery = useQuery({
    queryKey: feedQueryKey,
    queryFn: () => listFeedPosts({ limit: 10, page: 1 })
  });

  const createMutation = useMutation({
    mutationFn: createFeedPost,
    onError: () => setCreateError('Nao foi possivel publicar agora.'),
    onMutate: () => setCreateError(undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feedQueryKey });
    }
  });

  const likeMutation = useMutation({
    mutationFn: likeFeedPost,
    onMutate: (postId) => setLikingPostId(postId),
    onSettled: () => setLikingPostId(undefined),
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

  const posts = useMemo(() => feedQuery.data?.publicacoes ?? [], [feedQuery.data?.publicacoes]);

  const handleCreate = useCallback(
    async (text: string) => {
      await createMutation.mutateAsync(text);
    },
    [createMutation]
  );

  const handleLike = useCallback(
    (postId: string) => {
      if (!likeMutation.isPending) {
        likeMutation.mutate(postId);
      }
    },
    [likeMutation]
  );

  return (
    <section aria-label="Feed social" className="mx-auto w-full max-w-2xl space-y-4">
      {canCreate ? <CreatePost error={createError} isSubmitting={createMutation.isPending} onCreate={handleCreate} /> : null}
      {feedQuery.isLoading ? <LoadingFeed /> : null}
      {feedQuery.isError ? <FeedError /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? <EmptyFeed /> : null}
      {!feedQuery.isLoading && !feedQuery.isError && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard isLiking={likingPostId === post.id} key={post.id} onLike={handleLike} post={post} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
