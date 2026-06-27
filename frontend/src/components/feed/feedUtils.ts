import { Cargo } from '../../types/auth';
import { api } from '../../services/api';
import type { FeedStory } from '../../types/feed';

export type StoryGroup = {
  authorId: string;
  authorName: string;
  avatar?: string;
  hasUnseen: boolean;
  stories: FeedStory[];
};

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

export function canPinFeedPost(role?: Cargo): boolean {
  return role === Cargo.ADMIN || role === Cargo.DIRETOR || role === Cargo.COORDENADOR;
}

export function getFeedRoleLabel(role?: Cargo): string {
  if (role === Cargo.GREMIO) {
    return 'Gremio Estudantil';
  }

  if (role === Cargo.COORDENADOR) {
    return 'Coordenacao';
  }

  if (role === Cargo.DIRETOR) {
    return 'Diretor';
  }

  if (role === Cargo.PROFESSOR) {
    return 'Professor';
  }

  if (role === Cargo.ADMIN) {
    return 'Administrador';
  }

  return 'Aluno';
}

export function getAssetUrl(url?: string): string | undefined {
  if (!url || url.startsWith('http')) {
    return url;
  }

  const baseUrl = String(api.defaults.baseURL ?? '').replace(/\/api\/?$/, '');

  return `${baseUrl}${url}`;
}

export function groupStories(stories: FeedStory[]): StoryGroup[] {
  return stories.reduce<StoryGroup[]>((groups, story) => {
    const existingGroup = groups.find((group) => group.authorId === story.autor.id);

    if (existingGroup) {
      existingGroup.stories.push(story);
      existingGroup.hasUnseen = existingGroup.hasUnseen || !story.vistoPeloUsuario;
      return groups;
    }

    groups.push({
      authorId: story.autor.id,
      authorName: story.autor.nomeCompleto,
      avatar: story.autor.fotoPerfil,
      hasUnseen: !story.vistoPeloUsuario,
      stories: [story]
    });

    return groups;
  }, []);
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
