import bcrypt from 'bcrypt';

import { UserModel } from '../modules/users/models/user.model';
import { Cargo } from '../modules/users/types/user.types';

const ADMIN_USER = 'admin';
const LEGACY_ADMIN_USER = 'administrador';
const ADMIN_PASSWORD = 'administrador@123';

export async function ensureDefaultAdmin(): Promise<void> {
  const senha = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const officialAdmin = await UserModel.findOne({ usuario: ADMIN_USER }).select('+senha');
  const legacyAdmin = await UserModel.findOne({ usuario: LEGACY_ADMIN_USER }).select('+senha');
  const existingAdmin = officialAdmin ?? legacyAdmin;

  if (existingAdmin) {
    existingAdmin.nomeCompleto = existingAdmin.nomeCompleto || 'Administrador';
    existingAdmin.usuario = ADMIN_USER;
    existingAdmin.senha = senha;
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

    if (officialAdmin && legacyAdmin && officialAdmin.id !== legacyAdmin.id && legacyAdmin.cargo === Cargo.ADMIN) {
      legacyAdmin.cargo = Cargo.ALUNO;
      legacyAdmin.ativo = false;
      await legacyAdmin.save();
    }

    return;
  }

  await UserModel.create({
    nomeCompleto: 'Administrador',
    usuario: ADMIN_USER,
    senha,
    cargo: Cargo.ADMIN,
    pertenceGremio: false,
    fotoPerfil: '',
    bannerPerfil: '',
    bio: 'Administrador do Sistema',
    redeSocial: '',
    ativo: true
  });
}
