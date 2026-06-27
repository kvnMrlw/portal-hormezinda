import { UserRound } from 'lucide-react';

import { cn } from '../../lib/utils';

type AvatarProps = {
  src?: string;
  name?: string;
  className?: string;
};

// Avatar padrao para exibicao futura de usuarios autenticados.
export function Avatar({ className, name, src }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <div className={cn('flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-brand-blue', className)}>
      {src ? <img alt={name ?? 'Avatar'} className="h-full w-full object-cover" src={src} /> : initial ?? <UserRound className="h-5 w-5" />}
    </div>
  );
}
