import bcrypt from 'bcrypt';

import { UserModel } from '../modules/users/models/user.model';
import { Cargo } from '../modules/users/types/user.types';

const ADMIN_USER = 'admin';
const LEGACY_ADMIN_USER = 'administrador';

function getConfiguredDefaultAdminPassword(): string | undefined {
  const password = process.env.DEFAULT_ADMIN_PASSWORD?.trim();

  return password || undefined;
}

export async function ensureDefaultAdmin(): Promise<void> {
  const officialAdmin = await UserModel.findOne({ usuario: ADMIN_USER });
  const legacyAdmin = await UserModel.findOne({ usuario: LEGACY_ADMIN_USER });
  const existingAdmin = officialAdmin ?? legacyAdmin;

  if (existingAdmin) {
    existingAdmin.nomeCompleto = existingAdmin.nomeCompleto || 'Administrador';
    existingAdmin.usuario = ADMIN_USER;
    existingAdmin.cargo = Cargo.ADMIN;
    existingAdmin.ativo = true;
    existingAdmin.dataNascimento = undefined;
    existingAdmin.turno = undefined;
    existingAdmin.turma = undefined;
    existingAdmin.pertenceGremio = false;
    existingAdmin.fotoPerfil = existingAdmin.fotoPerfil ?? '';
    existingAdmin.bannerPerfil = existingAdmin.bannerPerfil ?? '';
    existingAdmin.bio = existingAdmin.bio || 'Administrador do Sistema';
    existingAdmin.redeSocial = existingAdmin.redeSocial ?? '';
    await existingAdmin.save();

    if (
      officialAdmin &&
      legacyAdmin &&
      officialAdmin.id !== legacyAdmin.id &&
      legacyAdmin.cargo === Cargo.ADMIN
    ) {
      legacyAdmin.cargo = Cargo.ALUNO;
      legacyAdmin.ativo = false;
      await legacyAdmin.save();
    }

    return;
  }

  const configuredPassword = getConfiguredDefaultAdminPassword();

  if (!configuredPassword) {
    console.warn(
      'Administrador padrao nao criado: configure DEFAULT_ADMIN_PASSWORD somente se precisar inicializar um banco vazio.'
    );
    return;
  }

  await UserModel.create({
    nomeCompleto: 'Administrador',
    usuario: ADMIN_USER,
    senha: await bcrypt.hash(configuredPassword, 10),
    cargo: Cargo.ADMIN,
    pertenceGremio: false,
    fotoPerfil: '',
    bannerPerfil: '',
    bio: 'Administrador do Sistema',
    redeSocial: '',
    ativo: true
  });
}
