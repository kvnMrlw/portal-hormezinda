import { Cargo, Sexo, type User } from '../types/auth';

export { Cargo as Role };

export enum Permission {
  EDIT_USERS = 'EDIT_USERS',
  DELETE_USERS = 'DELETE_USERS',
  RESET_PASSWORDS = 'RESET_PASSWORDS',
  EDIT_SCHEDULES = 'EDIT_SCHEDULES',
  EDIT_MENU = 'EDIT_MENU',
  EDIT_NOTICES = 'EDIT_NOTICES',
  EDIT_COURSES = 'EDIT_COURSES',
  EDIT_IDEAS = 'EDIT_IDEAS',
  EDIT_POSTS = 'EDIT_POSTS',
  EDIT_STORIES = 'EDIT_STORIES'
}

export const roleLabels: Record<Cargo, string> = {
  [Cargo.ADMIN]: 'Administrador',
  [Cargo.DIRETOR]: 'Diretor',
  [Cargo.COORDENADOR]: 'Coordenador',
  [Cargo.PROFESSOR]: 'Professor',
  [Cargo.GREMIO]: 'Gremio',
  [Cargo.ALUNO]: 'Aluno'
};

export const rolePermissions: Record<Cargo, Permission[]> = {
  [Cargo.ADMIN]: [
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.RESET_PASSWORDS,
    Permission.EDIT_SCHEDULES,
    Permission.EDIT_MENU,
    Permission.EDIT_NOTICES,
    Permission.EDIT_COURSES,
    Permission.EDIT_IDEAS,
    Permission.EDIT_POSTS,
    Permission.EDIT_STORIES
  ],
  [Cargo.DIRETOR]: [],
  [Cargo.COORDENADOR]: [],
  [Cargo.PROFESSOR]: [],
  [Cargo.GREMIO]: [Permission.EDIT_COURSES, Permission.EDIT_IDEAS, Permission.EDIT_POSTS, Permission.EDIT_STORIES],
  [Cargo.ALUNO]: []
};

export function isAdminRole(role?: Cargo): boolean {
  return role === Cargo.ADMIN;
}

export function canViewRole(viewerRole: Cargo | undefined, targetRole: Cargo): boolean {
  return targetRole !== Cargo.ADMIN || viewerRole === Cargo.ADMIN;
}

export function getRoleLabel(role?: Cargo): string {
  return role ? roleLabels[role] : 'Membro';
}

export function getDisplayRoleLabel(user?: Pick<User, 'cargo' | 'sexo'> | null): string {
  if (!user) {
    return 'Membro';
  }

  if (user.cargo === Cargo.PROFESSOR) {
    return user.sexo === Sexo.FEMININO ? 'Professora' : 'Professor';
  }

  if (user.cargo === Cargo.DIRETOR) {
    return user.sexo === Sexo.FEMININO ? 'Diretora' : 'Diretor';
  }

  if (user.cargo === Cargo.COORDENADOR) {
    return user.sexo === Sexo.FEMININO ? 'Coordenadora' : 'Coordenador';
  }

  return getRoleLabel(user.cargo);
}

export function hasGremioAccess(user?: Pick<User, 'cargo' | 'pertenceGremio'> | null): boolean {
  return Boolean(user && (user.cargo === Cargo.GREMIO || user.pertenceGremio));
}
