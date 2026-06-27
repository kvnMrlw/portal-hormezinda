import { memo } from 'react';

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
      <div className="flex gap-4 overflow-x-auto rounded-[1.75rem] bg-white/80 p-4 shadow-sm">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-100" key={index} />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-[1.75rem] bg-white/80 p-5 text-sm text-slate-500 shadow-sm">
        Nenhum story ativo agora.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto rounded-[1.75rem] bg-white/80 p-4 shadow-sm">
      {groups.map((group, index) => (
        <button className="w-20 shrink-0 text-center focus:outline-none" key={group.authorId} onClick={() => onOpen(index)} type="button">
          <span
            className={
              group.hasUnseen
                ? 'mx-auto block rounded-full bg-brand-blue p-1'
                : 'mx-auto block rounded-full bg-slate-200 p-1'
            }
          >
            <Avatar className="h-14 w-14 border-2 border-white" name={group.authorName} src={getAssetUrl(group.avatar)} />
          </span>
          <span className="mt-2 block truncate text-xs font-semibold text-slate-600">{group.authorName.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
});
