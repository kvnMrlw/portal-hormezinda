import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-100', className)} {...props} />;
}
