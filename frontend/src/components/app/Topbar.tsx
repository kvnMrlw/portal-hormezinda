import { Menu } from 'lucide-react';

import { Avatar } from '../ui/Avatar';
import { SearchInput } from '../ui/SearchInput';

type TopbarProps = {
  title: string;
};

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden" type="button">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-brand-navy">{title}</h1>
        </div>
        <div className="hidden w-full max-w-sm md:block">
          <SearchInput placeholder="Pesquisar no portal" />
        </div>
        <Avatar name="Portal Hormezinda" />
      </div>
    </header>
  );
}
