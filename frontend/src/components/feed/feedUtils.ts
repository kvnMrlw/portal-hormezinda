import { Cargo } from '../../types/auth';

const postAuthorRoles = new Set<Cargo>([
  Cargo.ADMIN,
  Cargo.DIRETOR,
  Cargo.COORDENADOR,
  Cargo.PROFESSOR,
  Cargo.GREMIO
]);

export function canCreateFeedPost(role?: Cargo): boolean {
  return Boolean(role && postAuthorRoles.has(role));
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1]
  ];

  for (const [unit, seconds] of ranges) {
    if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
      return formatter.format(Math.round(diffInSeconds / seconds), unit);
    }
  }

  return 'agora';
}
