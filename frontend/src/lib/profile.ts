import { Cargo, type User } from '../types/auth';
import { getDisplayRoleLabel, isAdminRole } from './roles';

export function getProfileHeadline(user?: User | null): string {
  if (!user) {
    return '';
  }

  if (isAdminRole(user.cargo)) {
    return 'Administrador do Sistema';
  }

  return getDisplayRoleLabel(user);
}

export function getProfileDetails(user?: User | null): string[] {
  if (!user || user.cargo === Cargo.ADMIN) {
    return [];
  }

  return [user.turma, user.turno].filter(Boolean) as string[];
}

export function calculateAge(dateValue?: string): string | null {
  if (!dateValue) {
    return null;
  }

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return `${age} anos`;
}
