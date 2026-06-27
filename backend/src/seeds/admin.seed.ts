import bcrypt from 'bcrypt';

import { connectDatabase } from '../config/database';
import { UserModel } from '../modules/users/models/user.model';
import { Cargo } from '../modules/users/types/user.types';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'administrador@123';

// Seed idempotente do administrador padrao do sistema.
async function seedAdmin(): Promise<void> {
  await connectDatabase();

  const existingAdmin = await UserModel.findOne({ usuario: ADMIN_USER });

  if (existingAdmin) {
    existingAdmin.cargo = Cargo.ADMIN;
    existingAdmin.dataNascimento = undefined;
    existingAdmin.turno = undefined;
    existingAdmin.turma = undefined;
    existingAdmin.bio = existingAdmin.bio || 'Administrador do Sistema';
    await existingAdmin.save();
    console.log('Admin seed skipped: usuario admin ja existe');
    return;
  }

  const senha = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await UserModel.create({
    nomeCompleto: 'Administrador Padrao',
    usuario: ADMIN_USER,
    senha,
    cargo: Cargo.ADMIN,
    fotoPerfil: '',
    bannerPerfil: '',
    bio: '',
    redeSocial: '',
    ativo: true
  });

  console.log('Admin seed created: usuario admin');
}

void seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await UserModel.db.close();
  });
