import { memo } from 'react';
import { motion } from 'framer-motion';

import { Avatar } from '../ui/Avatar';
import { getAssetUrl, type StoryGroup } from './feedUtils';

type StoriesBarProps = {
  groups: StoryGroup[];
  isLoading: boolean;
  onOpen: (groupIndex: number) => void;
};

export const StoriesBar = memo(function StoriesBar({ groups, isLoading, onOpen }: StoriesBarProps) {
  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-auto rounded-[1.75rem] border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:gap-6 sm:p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-slate-100 sm:h-28 sm:w-28"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-slate-950/5 bg-portal-surface p-6 text-sm font-medium text-slate-500 shadow-card ring-1 ring-white/80">
        Nenhum story ativo agora.
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto rounded-[1.75rem] border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:gap-6 sm:p-6">
      {groups.map((group, index) => (
        <motion.button
          className="group w-24 shrink-0 text-center focus:outline-none sm:w-28"
          key={group.authorId}
          onClick={() => onOpen(index)}
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
        >
          <span
            className={
              group.hasUnseen
                ? 'mx-auto block rounded-full bg-story-ring p-1.5 shadow-card transition group-focus-visible:ring-4 group-focus-visible:ring-blue-100'
                : 'mx-auto block rounded-full bg-slate-200 p-1.5 transition group-hover:bg-slate-300 group-focus-visible:ring-4 group-focus-visible:ring-blue-100'
            }
          >
            <Avatar
              className="h-20 w-20 border-4 border-white text-2xl shadow-card transition group-hover:scale-[1.03] sm:h-24 sm:w-24"
              name={group.authorName}
              src={getAssetUrl(group.avatar)}
            />
          </span>
          <span className="mt-3 block truncate text-xs font-bold text-slate-600 transition group-hover:text-brand-blue sm:text-sm">
            {group.authorName.split(' ')[0]}
          </span>
        </motion.button>
      ))}
    </div>
  );
});
