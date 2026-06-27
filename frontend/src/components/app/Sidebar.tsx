import { GraduationCap, Home, LockKeyhole, UserPlus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '../../lib/utils';

const navigation = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/login', icon: LockKeyhole, label: 'Login' },
  { href: '/cadastro', icon: UserPlus, label: 'Cadastro' }
];

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/85 px-5 py-6 backdrop-blur lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-soft">
          <GraduationCap className="h-6 w-6" />
        </div>
        <span className="font-semibold text-brand-navy">Portal Hormezinda</span>
      </div>

      <nav className="mt-8 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isActive ? 'bg-blue-50 text-brand-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                )
              }
              key={item.href}
              to={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
