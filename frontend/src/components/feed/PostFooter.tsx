import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { memo } from 'react';

import { cn } from '../../lib/utils';

type PostFooterProps = {
  commentsCount: number;
  isLiked: boolean;
  isLiking: boolean;
  likesCount: number;
  onLike: () => void;
};

export const PostFooter = memo(function PostFooter({
  commentsCount,
  isLiked,
  isLiking,
  likesCount,
  onLike
}: PostFooterProps) {
  return (
    <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
      <button
        aria-pressed={isLiked}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100',
          isLiked ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-rose-600'
        )}
        disabled={isLiked || isLiking}
        onClick={onLike}
        type="button"
      >
        <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
        <span>{likesCount}</span>
      </button>
      <button
        className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition duration-300 hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
        type="button"
      >
        <MessageCircle className="h-4 w-4" />
        <span>
          Coment&aacute;rios
          {commentsCount > 0 ? ` ${commentsCount}` : ''}
        </span>
      </button>
      <button
        className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition duration-300 hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
        type="button"
      >
        <Share2 className="h-4 w-4" />
        <span>Compartilhar</span>
      </button>
    </footer>
  );
});
