import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        className={cn(
          'portal-search-input w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-medium focus:-translate-y-0.5 focus:ring-4',
          className,
        )}
        type="search"
        {...props}
      />
    </label>
  );
}
