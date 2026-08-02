import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-slate-100 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:animate-[portal-shimmer_1.25s_infinite]',
        className,
      )}
      {...props}
    />
  );
}
