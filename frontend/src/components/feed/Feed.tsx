import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Bell, CalendarDays, ImagePlus, Plus, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { getAssetUrl } from '../../lib/assets';
import {
  createFeedPost,
  createFeedStory,
  deleteFeedPost,
  deleteFeedStory,
  listFeedPosts,
  listFeedStories,
  markFeedStoryAsViewed,
  reactToFeedPost,
  setFeedPostPinned,
} from '../../services/feed';
import type {
  CreatePostPayload,
  CreateStoryPayload,
  FeedResponse,
  FeedStory,
  ReactionEmoji,
} from '../../types/feed';
import { Avatar } from '../ui/Avatar';
import { CreateContentModal } from './CreateContentModal';
import { DeletePostDialog } from './DeletePostDialog';
import { EmptyFeed } from './EmptyFeed';
import {
  canCreateFeedPost,
  canDeleteFeedPost,
  canDeleteFeedStory,
  canPinFeedPost,
  groupStories,
} from './feedUtils';
import { LoadingFeed } from './LoadingFeed';
import { PostCard } from './PostCard';
import { StoriesBar } from './StoriesBar';
import { StoryViewer } from './StoryViewer';

const feedQueryKey = ['feed', 'posts'] as const;
const storiesQueryKey = ['feed', 'stories'] as const;

function FeedError() {
  return (
    <section className="ph-feed-error">
      <AlertCircle />
      <div>
        <h2>Não foi possível carregar as publicações.</h2>
        <p>Tente novamente em alguns instantes.</p>
      </div>
    </section>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
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
    queryFn: () => listFeedPosts({ limit: 10, page: 1 }),
  });

  const storiesQuery = useQuery({
    queryKey: storiesQueryKey,
    queryFn: listFeedStories,
  });

  const createPostMutation = useMutation({
    mutationFn: createFeedPost,
    onError: () => setCreateError('Não foi possível publicar agora.'),
    onMutate: () => setCreateError(undefined),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: feedQueryKey }),
  });

  const createStoryMutation = useMutation({
    mutationFn: createFeedStory,
    onError: () => setCreateError('Não foi possível publicar agora.'),
    onMutate: () => setCreateError(undefined),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: storiesQueryKey }),
  });

  const reactionMutation = useMutation({
    mutationFn: ({ emoji, postId }: { emoji: ReactionEmoji; postId: string }) =>
      reactToFeedPost(postId, emoji),
    onMutate: ({ postId }) => setReactingPostId(postId),
    onSettled: () => setReactingPostId(undefined),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<FeedResponse>(feedQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          publicacoes: current.publicacoes.map((post) =>
            post.id === updatedPost.id ? updatedPost : post,
          ),
        };
      });
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ pinned, postId }: { pinned: boolean; postId: string }) =>
      setFeedPostPinned(postId, pinned),
    onMutate: ({ postId }) => setPinningPostId(postId),
    onSettled: () => setPinningPostId(undefined),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: feedQueryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeedPost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });
      const previousFeed = queryClient.getQueryData<FeedResponse>(feedQueryKey);
      queryClient.setQueryData<FeedResponse>(feedQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          publicacoes: current.publicacoes.filter((post) => post.id !== postId),
          paginacao: { ...current.paginacao, total: Math.max(current.paginacao.total - 1, 0) },
        };
      });
      setPostToDeleteId(undefined);
      return { previousFeed };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousFeed) queryClient.setQueryData(feedQueryKey, context.previousFeed);
    },
    onSettled: async () => queryClient.invalidateQueries({ queryKey: feedQueryKey }),
  });

  const deleteStoryMutation = useMutation({
    mutationFn: deleteFeedStory,
    onMutate: async (storyId) => {
      setDeletingStoryId(storyId);
      await queryClient.cancelQueries({ queryKey: storiesQueryKey });
      const previousStories = queryClient.getQueryData<FeedStory[]>(storiesQueryKey);
      queryClient.setQueryData<FeedStory[]>(storiesQueryKey, (current) =>
        current?.filter((story) => story.id !== storyId),
      );
      return { previousStories };
    },
    onError: (_error, _storyId, context) => {
      if (context?.previousStories) queryClient.setQueryData(storiesQueryKey, context.previousStories);
    },
    onSettled: async () => {
      setDeletingStoryId(undefined);
      await queryClient.invalidateQueries({ queryKey: storiesQueryKey });
    },
  });

  const viewStoryMutation = useMutation({
    mutationFn: markFeedStoryAsViewed,
    onSuccess: (updatedStory) => {
      queryClient.setQueryData<FeedStory[]>(storiesQueryKey, (current) =>
        current?.map((story) => (story.id === updatedStory.id ? updatedStory : story)),
      );
    },
  });

  const posts = useMemo(() => feedQuery.data?.publicacoes ?? [], [feedQuery.data?.publicacoes]);
  const storyGroups = useMemo(() => groupStories(storiesQuery.data ?? []), [storiesQuery.data]);

  const handleCreate = useCallback(
    async (payload: CreatePostPayload) => createPostMutation.mutateAsync(payload),
    [createPostMutation],
  );
  const handleCreateStory = useCallback(
    async (payload: CreateStoryPayload) => createStoryMutation.mutateAsync(payload),
    [createStoryMutation],
  );
  const handleReact = useCallback(
    (postId: string, emoji: ReactionEmoji) => {
      if (!reactionMutation.isPending) reactionMutation.mutate({ postId, emoji });
    },
    [reactionMutation],
  );
  const handlePin = useCallback(
    (postId: string, pinned: boolean) => {
      if (!pinMutation.isPending) pinMutation.mutate({ postId, pinned });
    },
    [pinMutation],
  );
  const handleViewStory = useCallback(
    (storyId: string) => viewStoryMutation.mutate(storyId),
    [viewStoryMutation],
  );
  const handleDeleteStory = useCallback(
    (storyId: string) => {
      if (window.confirm('Deseja realmente excluir este Story?') && !deleteStoryMutation.isPending) {
        deleteStoryMutation.mutate(storyId);
      }
    },
    [deleteStoryMutation],
  );
  const handleConfirmDelete = useCallback(() => {
    if (postToDeleteId && !deleteMutation.isPending) deleteMutation.mutate(postToDeleteId);
  }, [deleteMutation, postToDeleteId]);

  const firstName = user?.nomeCompleto?.trim().split(/\s+/)[0] ?? 'Visitante';

  return (
    <section aria-label="Feed social" className="ph-home">
      <section className="ph-community-head">
        <div className="ph-community-copy">
          <span className="ph-eyebrow"><Sparkles /> Comunidade Hormezinda</span>
          <h1>{getGreeting()}, {firstName}! <span aria-hidden="true">👋</span></h1>
          <p>Novidades, momentos e informações importantes da escola em um só lugar.</p>
        </div>
        {canCreate ? (
          <button className="ph-primary-action" onClick={() => setIsCreateOpen(true)} type="button">
            <Plus /> Criar publicação
          </button>
        ) : null}
        <div className="ph-head-decoration" aria-hidden="true">
          <span className="ph-deco-circle one" />
          <span className="ph-deco-circle two" />
          <span className="ph-deco-grid" />
        </div>

      </section>

      <StoriesBar
        canCreate={canCreate}
        currentUserAvatar={user?.fotoPerfil}
        currentUserName={user?.nomeCompleto}
        groups={storyGroups}
        isLoading={storiesQuery.isLoading}
        onCreate={() => setIsCreateOpen(true)}
        onOpen={setViewerGroupIndex}
      />

      <div className="ph-home-grid">
        <main className="ph-feed-column">
          {canCreate ? (
            <section className="ph-composer">
              <div className="ph-composer-main">
                <Avatar
                  className="ph-composer-avatar"
                  name={user?.nomeCompleto}
                  src={getAssetUrl(user?.fotoPerfil)}
                />
                <button className="ph-composer-prompt" onClick={() => setIsCreateOpen(true)} type="button">
                  No que você está pensando?
                </button>
              </div>
              <div className="ph-composer-actions">
                <button onClick={() => setIsCreateOpen(true)} type="button"><ImagePlus /> Foto/vídeo</button>
                <button onClick={() => setIsCreateOpen(true)} type="button"><Sparkles /> Story</button>
                <button className="ph-composer-publish" onClick={() => setIsCreateOpen(true)} type="button"><Plus /> Publicar</button>
              </div>
            </section>
          ) : null}

          <nav className="ph-feed-tabs" aria-label="Filtros visuais do feed">
            <button className="active" type="button">Feed</button>
            <button type="button">Para você</button>
            <button type="button">Seguindo</button>
          </nav>

          {feedQuery.isLoading ? <LoadingFeed /> : null}
          {feedQuery.isError ? <FeedError /> : null}
          {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? <EmptyFeed /> : null}
          {!feedQuery.isLoading && !feedQuery.isError && posts.length > 0 ? (
            <div className="ph-feed-posts">
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
        </main>

        <aside className="ph-home-rail" aria-label="Atalhos do portal">
          <section className="ph-rail-card ph-rail-card-dark">
            <span className="ph-rail-label">Portal agora</span>
            <strong>{storyGroups.length}</strong>
            <p>{storyGroups.length === 1 ? 'story ativo na comunidade' : 'stories ativos na comunidade'}</p>
          </section>

          <section className="ph-rail-card">
            <span className="ph-rail-label">Acesso rápido</span>
            <Link to="/avisos"><Bell /> <span><strong>Avisos</strong><small>Comunicados da escola</small></span></Link>
            <Link to="/horarios"><CalendarDays /> <span><strong>Horários</strong><small>Consulte sua rotina</small></span></Link>
          </section>

          <section className="ph-rail-card ph-rail-note">
            <span className="ph-rail-label">Comunidade</span>
            <h3>Um portal com cara de escola.</h3>
            <p>O feed reúne apenas conteúdos e módulos que já fazem parte do Portal Hormezinda.</p>
          </section>
        </aside>
      </div>

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
