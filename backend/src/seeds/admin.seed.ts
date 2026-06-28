import { connectDatabase } from '../config/database';
import { ensureDefaultAdmin } from './ensureAdmin';
import { UserModel } from '../modules/users/models/user.model';

// Seed idempotente do administrador padrao do sistema.
async function seedAdmin(): Promise<void> {
  await connectDatabase();
  await ensureDefaultAdmin();
  console.log('Admin padrao garantido: admin');
}

void seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await UserModel.db.close();
  });
