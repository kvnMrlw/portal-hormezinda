import bcrypt from 'bcrypt';
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual
} from 'crypto';
import { Types } from 'mongoose';

import { env } from '../../../config/env';
import { AppError } from '../../../middlewares/error.middleware';
import { AccountEmailModel, type AccountEmailDocument } from '../models/account-email.model';
import {
  AuthCodeModel,
  type AuthCodeDocument,
  type AuthCodePurpose
} from '../models/auth-code.model';
import { AuthRepository } from '../repository/auth.repository';
import { sendAuthCodeEmail } from './mail.service';

const CODE_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const PASSWORD_SALT_ROUNDS = 10;

function normalizeUsuario(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');

  if (!local || !domain) return 'e-mail cadastrado';

  const visibleCount = local.length <= 2 ? 1 : 2;
  return `${local.slice(0, visibleCount)}${'*'.repeat(
    Math.max(4, local.length - visibleCount)
  )}@${domain}`;
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

function hashCode(code: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(code).digest('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function safeHexEquals(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export class EmailAuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async assertEmailAvailable(emailInput: string): Promise<void> {
    const email = normalizeEmail(emailInput);
    const exists = await AccountEmailModel.exists({ email });

    if (exists) {
      throw new AppError('Este e-mail ja esta vinculado a uma conta', 409);
    }
  }

  async finishRegistration(input: {
    usuarioId: string;
    usuario: string;
    email: string;
    nomeCompleto?: string;
  }) {
    const usuario = normalizeUsuario(input.usuario);
    const email = normalizeEmail(input.email);

    await AccountEmailModel.create({
      usuarioId: new Types.ObjectId(input.usuarioId),
      usuario,
      email,
      verificado: false,
      verificadoEm: null
    });

    let emailSent = true;

    try {
      await this.issueCode({
        usuario,
        purpose: 'verify_email',
        nomeCompleto: input.nomeCompleto,
        ignoreCooldown: true
      });
    } catch (error) {
      emailSent = false;
      console.error('[auth-email] Falha no primeiro envio:', error);
    }

    return {
      usuario,
      emailMascarado: maskEmail(email),
      emailSent,
      resendIn: RESEND_COOLDOWN_SECONDS
    };
  }

  async assertCanLogin(usuarioInput: string): Promise<void> {
    const account = await AccountEmailModel.findOne({
      usuario: normalizeUsuario(usuarioInput)
    }).lean();

    // Contas antigas continuam funcionando normalmente.
    if (!account) return;

    if (!account.verificado) {
      throw new AppError('Confirme seu e-mail antes de entrar', 403);
    }
  }

  async resendVerification(usuarioInput: string) {
    const account = await this.getAccount(usuarioInput);

    if (account.verificado) {
      return {
        alreadyVerified: true,
        emailMascarado: maskEmail(account.email),
        resendIn: 0
      };
    }

    const user = await this.authRepository.findByUsuario(account.usuario);
    const sent = await this.issueCode({
      usuario: account.usuario,
      purpose: 'verify_email',
      nomeCompleto: user?.nomeCompleto
    });

    return { ...sent, alreadyVerified: false };
  }

  async verifyEmail(usuarioInput: string, codigo: string) {
    const account = await this.getAccount(usuarioInput);

    if (account.verificado) {
      return {
        verified: true,
        emailMascarado: maskEmail(account.email)
      };
    }

    const code = await this.assertValidCode(account, 'verify_email', codigo);

    await Promise.all([
      AccountEmailModel.updateOne(
        { _id: account._id },
        { $set: { verificado: true, verificadoEm: new Date() } }
      ),
      AuthCodeModel.updateOne(
        { _id: code._id },
        { $set: { usedAt: new Date(), verifiedAt: new Date() } }
      )
    ]);

    return {
      verified: true,
      emailMascarado: maskEmail(account.email)
    };
  }

  async recoveryInfo(usuarioInput: string) {
    const usuario = normalizeUsuario(usuarioInput);
    const account = await AccountEmailModel.findOne({ usuario }).lean();

    if (!account) {
      const oldUser = await this.authRepository.findByUsuario(usuario);

      if (!oldUser) {
        throw new AppError('Usuario nao encontrado', 404);
      }

      throw new AppError(
        'Esta conta foi criada antes do sistema de e-mail e ainda nao possui e-mail cadastrado',
        400
      );
    }

    if (!account.verificado) {
      throw new AppError('O e-mail desta conta ainda nao foi confirmado', 403);
    }

    return {
      usuario,
      emailMascarado: maskEmail(account.email)
    };
  }

  async sendPasswordResetCode(usuarioInput: string) {
    const account = await this.getAccount(usuarioInput);

    if (!account.verificado) {
      throw new AppError('O e-mail desta conta ainda nao foi confirmado', 403);
    }

    const user = await this.authRepository.findByUsuario(account.usuario);

    return this.issueCode({
      usuario: account.usuario,
      purpose: 'reset_password',
      nomeCompleto: user?.nomeCompleto
    });
  }

  async verifyPasswordResetCode(usuarioInput: string, codigo: string) {
    const account = await this.getAccount(usuarioInput);
    const code = await this.assertValidCode(
      account,
      'reset_password',
      codigo
    );

    const resetToken = randomBytes(32).toString('hex');

    await AuthCodeModel.updateOne(
      { _id: code._id },
      {
        $set: {
          verifiedAt: new Date(),
          resetTokenHash: hashToken(resetToken),
          resetTokenExpiresAt: new Date(
            Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000
          )
        }
      }
    );

    return {
      resetToken,
      expiresIn: RESET_TOKEN_TTL_MINUTES * 60
    };
  }

  async resetPassword(input: {
    usuario: string;
    resetToken: string;
    novaSenha: string;
  }): Promise<void> {
    const account = await this.getAccount(input.usuario);

    const code = await AuthCodeModel.findOne({
      usuarioId: account.usuarioId,
      purpose: 'reset_password',
      usedAt: null,
      verifiedAt: { $ne: null },
      resetTokenHash: hashToken(input.resetToken),
      resetTokenExpiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!code) {
      throw new AppError(
        'Esta autorizacao expirou. Solicite um novo codigo',
        400
      );
    }

    const senha = await bcrypt.hash(input.novaSenha, PASSWORD_SALT_ROUNDS);

    await this.authRepository.updatePassword(
      account.usuarioId.toString(),
      senha
    );

    await AuthCodeModel.updateMany(
      {
        usuarioId: account.usuarioId,
        purpose: 'reset_password',
        usedAt: null
      },
      { $set: { usedAt: new Date() } }
    );
  }

  private async getAccount(
    usuarioInput: string
  ): Promise<AccountEmailDocument> {
    const account = await AccountEmailModel.findOne({
      usuario: normalizeUsuario(usuarioInput)
    });

    if (!account) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return account;
  }

  private async issueCode(input: {
    usuario: string;
    purpose: AuthCodePurpose;
    nomeCompleto?: string;
    ignoreCooldown?: boolean;
  }) {
    const account = await this.getAccount(input.usuario);

    const previous = await AuthCodeModel.findOne({
      usuarioId: account.usuarioId,
      purpose: input.purpose,
      usedAt: null
    }).sort({ createdAt: -1 });

    if (previous && !input.ignoreCooldown) {
      const createdAt = previous.createdAt?.getTime() ?? 0;
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);

      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        throw new AppError(
          `Aguarde ${RESEND_COOLDOWN_SECONDS - elapsed} segundos para reenviar o codigo`,
          429
        );
      }
    }

    await AuthCodeModel.updateMany(
      {
        usuarioId: account.usuarioId,
        purpose: input.purpose,
        usedAt: null
      },
      { $set: { usedAt: new Date() } }
    );

    const plainCode = generateCode();

    const document = await AuthCodeModel.create({
      usuarioId: account.usuarioId,
      purpose: input.purpose,
      codeHash: hashCode(plainCode),
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
      usedAt: null,
      verifiedAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null
    });

    try {
      await sendAuthCodeEmail({
        to: account.email,
        code: plainCode,
        nomeCompleto: input.nomeCompleto,
        purpose: input.purpose
      });
    } catch (error) {
      await AuthCodeModel.deleteOne({ _id: document._id });
      throw error;
    }

    return {
      emailMascarado: maskEmail(account.email),
      resendIn: RESEND_COOLDOWN_SECONDS,
      expiresIn: CODE_TTL_MINUTES * 60
    };
  }

  private async assertValidCode(
    account: AccountEmailDocument,
    purpose: AuthCodePurpose,
    codigoInput: string
  ): Promise<AuthCodeDocument> {
    const codigo = codigoInput.replace(/\D/g, '');

    if (!/^\d{6}$/.test(codigo)) {
      throw new AppError('Digite os 6 numeros do codigo', 400);
    }

    const document = await AuthCodeModel.findOne({
      usuarioId: account.usuarioId,
      purpose,
      usedAt: null
    }).sort({ createdAt: -1 });

    if (!document) {
      throw new AppError('Solicite um novo codigo', 400);
    }

    if (document.expiresAt.getTime() < Date.now()) {
      document.usedAt = new Date();
      await document.save();
      throw new AppError('Este codigo expirou. Solicite outro', 400);
    }

    if (document.attempts >= MAX_ATTEMPTS) {
      throw new AppError(
        'Limite de tentativas atingido. Solicite um novo codigo',
        429
      );
    }

    if (!safeHexEquals(hashCode(codigo), document.codeHash)) {
      document.attempts += 1;
      await document.save();
      throw new AppError('Codigo incorreto', 400);
    }

    return document;
  }
}
