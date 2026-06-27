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
          'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-navy outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100',
          className
        )}
        type="search"
        {...props}
      />
    </label>
  );
}
