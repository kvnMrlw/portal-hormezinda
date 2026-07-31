import { CheckCircle2, Crown, GraduationCap, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { getDisplayRoleLabel } from '../../lib/roles';
import { Cargo, type User } from '../../types/auth';
import { cn } from '../../lib/utils';

const roleBadgeConfig: Record<Cargo, { className: string; icon: LucideIcon }> = {
  [Cargo.ADMIN]: { className: 'bg-slate-900 text-white ring-slate-800', icon: ShieldCheck },
  [Cargo.DIRETOR]: { className: 'bg-amber-50 text-amber-700 ring-amber-100', icon: Crown },
  [Cargo.COORDENADOR]: { className: 'bg-violet-50 text-violet-700 ring-violet-100', icon: Sparkles },
  [Cargo.PROFESSOR]: { className: 'bg-blue-50 text-brand-blue ring-blue-100', icon: GraduationCap },
  [Cargo.GREMIO]: { className: 'bg-sky-50 text-brand-blue ring-sky-100', icon: CheckCircle2 },
  [Cargo.ALUNO]: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: UserRound }
};

export function RoleBadge({ className, user }: { className?: string; user: Pick<User, 'cargo' | 'pertenceGremio' | 'sexo'> }) {
  const config = user.pertenceGremio && user.cargo !== Cargo.GREMIO ? roleBadgeConfig[Cargo.GREMIO] : roleBadgeConfig[user.cargo];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1', config.className, className)}>
      {user.pertenceGremio || user.cargo === Cargo.GREMIO ? <CheckCircle2 className="h-3.5 w-3.5 fill-current text-white" /> : <Icon className="h-3.5 w-3.5" />}
      {user.pertenceGremio || user.cargo === Cargo.GREMIO ? 'Gremio Estudantil' : getDisplayRoleLabel(user)}
    </span>
  );
}

export function CompactRoleIcon({ user }: { user: Pick<User, 'cargo' | 'pertenceGremio' | 'sexo'> }) {
  const config = user.pertenceGremio && user.cargo !== Cargo.GREMIO ? roleBadgeConfig[Cargo.GREMIO] : roleBadgeConfig[user.cargo];
  const Icon = user.pertenceGremio || user.cargo === Cargo.GREMIO ? CheckCircle2 : config.icon;

  return (
    <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full ring-1', config.className)}>
      <Icon className={cn('h-4 w-4', (user.pertenceGremio || user.cargo === Cargo.GREMIO) && 'fill-current text-white')} />
    </span>
  );
}
