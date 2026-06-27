import { motion } from 'framer-motion';
import { memo } from 'react';

import type { FeedPost } from '../../types/feed';
import { PostFooter } from './PostFooter';
import { PostHeader } from './PostHeader';

type PostCardProps = {
  isLiking: boolean;
  onLike: (postId: string) => void;
  post: FeedPost;
};

export const PostCard = memo(function PostCard({ isLiking, onLike, post }: PostCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-[1.75rem] border border-white bg-white/95 p-5 shadow-sm transition-shadow duration-300 hover:shadow-soft sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <PostHeader author={post.autor} date={post.data} />
      <p className="whitespace-pre-wrap break-words text-[0.98rem] leading-7 text-slate-700">{post.texto}</p>
      <PostFooter
        commentsCount={post.quantidadeComentarios}
        isLiked={post.curtidoPeloUsuario}
        isLiking={isLiking}
        likesCount={post.quantidadeCurtidas}
        onLike={() => onLike(post.id)}
      />
    </motion.article>
  );
});
