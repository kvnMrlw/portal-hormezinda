import { motion } from 'framer-motion';
import { Pin, PinOff, Trash2 } from 'lucide-react';
import { memo } from 'react';

import type { FeedPost } from '../../types/feed';
import type { ReactionEmoji } from '../../types/feed';
import { getAssetUrl } from './feedUtils';
import { PostFooter } from './PostFooter';
import { PostHeader } from './PostHeader';

type PostCardProps = {
  canDelete: boolean;
  canPin: boolean;
  isDeleting: boolean;
  isPinning: boolean;
  isReacting: boolean;
  onDelete: (postId: string) => void;
  onPin: (postId: string, pinned: boolean) => void;
  onReact: (postId: string, emoji: ReactionEmoji) => void;
  post: FeedPost;
};

export const PostCard = memo(function PostCard({
  canDelete,
  canPin,
  isDeleting,
  isPinning,
  isReacting,
  onDelete,
  onPin,
  onReact,
  post
}: PostCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-[1.75rem] border border-white bg-white/95 p-5 shadow-sm transition-shadow duration-300 hover:shadow-soft sm:p-7 lg:p-8"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between gap-3">
        <PostHeader author={post.autor} date={post.data} />
        <div className="flex shrink-0 items-center gap-1">
          {canPin ? (
            <button
              aria-label={post.fixado ? 'Desafixar publicacao' : 'Fixar publicacao'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
              disabled={isPinning}
              onClick={() => onPin(post.id, !post.fixado)}
              type="button"
            >
              {post.fixado ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          ) : null}
          {canDelete ? (
            <button
              aria-label="Excluir publicacao"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
              disabled={isDeleting}
              onClick={() => onDelete(post.id)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      {post.fixado ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue">
          <Pin className="h-3.5 w-3.5" />
          Publicacao fixada
        </div>
      ) : null}
      {post.texto ? <p className="whitespace-pre-wrap break-words text-[1.03rem] leading-8 text-slate-700 sm:text-lg">{post.texto}</p> : null}
      {post.imagens[0] ? (
        <img
          alt={post.imagens[0].alt ?? 'Imagem da publicacao'}
          className="max-h-[48rem] w-full rounded-[1.5rem] object-cover ring-1 ring-slate-100"
          decoding="async"
          loading="lazy"
          src={getAssetUrl(post.imagens[0].url)}
        />
      ) : null}
      <PostFooter
        isReacting={isReacting}
        myReaction={post.minhaReacao}
        onReact={(emoji) => onReact(post.id, emoji)}
        reactions={post.reacoes}
      />
    </motion.article>
  );
});
