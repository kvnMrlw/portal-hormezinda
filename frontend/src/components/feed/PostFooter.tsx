import { SmilePlus } from 'lucide-react';
import { memo } from 'react';

import { cn } from '../../lib/utils';
import { reactionEmojis, type ReactionEmoji, type ReactionSummary } from '../../types/feed';

type PostFooterProps = {
  isReacting: boolean;
  myReaction?: ReactionEmoji;
  onReact: (emoji: ReactionEmoji) => void;
  reactions: ReactionSummary[];
};

export const PostFooter = memo(function PostFooter({ isReacting, myReaction, onReact, reactions }: PostFooterProps) {
  return (
    <footer className="space-y-3 border-t border-slate-100 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-50 px-3 text-sm font-semibold text-slate-600">
          <SmilePlus className="h-4 w-4" />
          Reagir
        </span>
        {reactionEmojis.map((emoji) => (
          <button
            aria-pressed={myReaction === emoji}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full text-lg transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-100',
              myReaction === emoji ? 'bg-blue-50 shadow-sm ring-1 ring-blue-200' : 'bg-white hover:bg-slate-50'
            )}
            disabled={isReacting}
            key={emoji}
            onClick={() => onReact(emoji)}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
      {reactions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reactions.map((reaction) => (
            <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600" key={reaction.emoji}>
              {reaction.emoji} {reaction.quantidade}
            </span>
          ))}
        </div>
      ) : null}
    </footer>
  );
});
