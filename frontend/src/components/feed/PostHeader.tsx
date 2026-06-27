import { BadgeCheck } from 'lucide-react';
import { memo } from 'react';

import { getRoleLabel } from '../../lib/roles';
import { Cargo, type User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { formatRelativeDate } from './feedUtils';

type PostHeaderProps = {
  author: User;
  date: string;
};

export const PostHeader = memo(function PostHeader({ author, date }: PostHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <Avatar className="h-12 w-12 shrink-0 ring-4 ring-slate-50" name={author.nomeCompleto} src={author.fotoPerfil} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-brand-navy">{author.nomeCompleto}</h3>
          {author.cargo === Cargo.GREMIO ? (
            <Badge className="gap-1 bg-emerald-50 text-emerald-700" variant="success">
              <BadgeCheck className="h-3.5 w-3.5" />
              Gremio
            </Badge>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{getRoleLabel(author.cargo)}</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-300" />
          <time dateTime={date}>{formatRelativeDate(date)}</time>
        </div>
      </div>
    </header>
  );
});
