import { Skeleton } from '../ui/Skeleton';

export function LoadingFeed() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <article className="space-y-5 rounded-[1.75rem] border border-white bg-white/95 p-5 shadow-sm sm:p-6" key={index}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-7/12" />
          </div>
          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </article>
      ))}
    </div>
  );
}
