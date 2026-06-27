import { Cargo } from '../../users/types/user.types';

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
  [Cargo.GREMIO]: [],
  [Cargo.ALUNO]: []
};

export function hasRole(userRole: Cargo, allowedRoles: Cargo[]): boolean {
  return allowedRoles.includes(userRole);
}

export function hasPermission(userRole: Cargo, permission: Permission): boolean {
  return rolePermissions[userRole].includes(permission);
}

export function canViewRole(viewerRole: Cargo, targetRole: Cargo): boolean {
  return targetRole !== Cargo.ADMIN || viewerRole === Cargo.ADMIN;
}
