import bcrypt from 'bcrypt';

import { connectDatabase } from '../config/database';
import { Cargo, Turma, Turno, UserModel } from '../models/user.model';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'administrador@123';

// Seed idempotente do administrador padrao do sistema.
async function seedAdmin(): Promise<void> {
  await connectDatabase();

  const existingAdmin = await UserModel.findOne({ usuario: ADMIN_USER });

  if (existingAdmin) {
    console.log('Admin seed skipped: usuario admin ja existe');
    return;
  }

  const senha = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await UserModel.create({
    nomeCompleto: 'Administrador Padrao',
    usuario: ADMIN_USER,
    senha,
    dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
    turno: Turno.MATUTINO,
    turma: Turma.PRIMEIRO_A,
    cargo: Cargo.ADMIN,
    fotoPerfil: '',
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
