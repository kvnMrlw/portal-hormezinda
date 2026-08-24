import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { AuthService } from '../service/auth.service';
import { EmailAuthService } from '../service/email-auth.service';
import { RecaptchaService } from '../service/recaptcha.service';
import type { AuthenticatedRequest } from '../types/auth.types';
import {
  captchaUsuarioSchema,
  codeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  usuarioSchema
} from '../validation/auth.validation';

const authService = new AuthService();
const emailAuthService = new EmailAuthService();
const recaptchaService = new RecaptchaService();

function formatValidationError(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ');
}

export async function register(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsedBody = registerSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(formatValidationError(parsedBody.error), 400);
    }

    await recaptchaService.verify(parsedBody.data.captchaToken);
    await emailAuthService.assertEmailAvailable(parsedBody.data.email);

    const result = await authService.register(parsedBody.data);

    const verification = await emailAuthService.finishRegistration({
      usuarioId: result.usuario.id,
      usuario: parsedBody.data.usuario,
      email: parsedBody.data.email,
      nomeCompleto: parsedBody.data.nomeCompleto
    });

    return response.status(201).json(
      apiResponse(
        {
          requiresEmailVerification: true,
          usuario: verification.usuario,
          emailMascarado: verification.emailMascarado,
          emailSent: verification.emailSent,
          resendIn: verification.resendIn
        },
        {
          message: verification.emailSent
            ? 'Cadastro realizado. Enviamos um codigo para confirmar seu e-mail'
            : 'Cadastro realizado. Use Reenviar codigo para confirmar seu e-mail'
        }
      )
    );
  } catch (error) {
    return next(error);
  }
}

export async function login(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(formatValidationError(parsedBody.error), 400);
    }

    await recaptchaService.verify(parsedBody.data.captchaToken);
    await emailAuthService.assertCanLogin(parsedBody.data.usuario);

    const result = await authService.login(parsedBody.data);

    return response
      .status(200)
      .json(apiResponse(result, { message: 'Login realizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function refresh(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const refreshToken =
      typeof request.body?.refreshToken === 'string'
        ? request.body.refreshToken
        : '';

    if (!refreshToken) {
      throw new AppError('Refresh token nao informado', 401);
    }

    const result = await authService.refresh(refreshToken);

    return response
      .status(200)
      .json(apiResponse(result, { message: 'Sessao renovada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export function me(
  request: AuthenticatedRequest,
  response: Response
): Response {
  return response.status(200).json(
    apiResponse(
      { usuario: request.user },
      { message: 'Usuario autenticado' }
    )
  );
}

export async function resendVerificationCode(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = usuarioSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    const result = await emailAuthService.resendVerification(
      parsed.data.usuario
    );

    return response.status(200).json(
      apiResponse(result, {
        message: result.alreadyVerified
          ? 'Este e-mail ja foi confirmado'
          : 'Novo codigo enviado'
      })
    );
  } catch (error) {
    return next(error);
  }
}

export async function verifyEmailCode(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = codeSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    const result = await emailAuthService.verifyEmail(
      parsed.data.usuario,
      parsed.data.codigo
    );

    return response
      .status(200)
      .json(
        apiResponse(result, { message: 'E-mail confirmado com sucesso' })
      );
  } catch (error) {
    return next(error);
  }
}

export async function passwordRecoveryInfo(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = captchaUsuarioSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    await recaptchaService.verify(parsed.data.captchaToken);

    const result = await emailAuthService.recoveryInfo(parsed.data.usuario);

    return response
      .status(200)
      .json(apiResponse(result, { message: 'Conta localizada' }));
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = captchaUsuarioSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    await recaptchaService.verify(parsed.data.captchaToken);

    const result = await emailAuthService.sendPasswordResetCode(
      parsed.data.usuario
    );

    return response
      .status(200)
      .json(
        apiResponse(result, { message: 'Codigo de recuperacao enviado' })
      );
  } catch (error) {
    return next(error);
  }
}

export async function verifyPasswordResetCode(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = codeSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    const result = await emailAuthService.verifyPasswordResetCode(
      parsed.data.usuario,
      parsed.data.codigo
    );

    return response
      .status(200)
      .json(apiResponse(result, { message: 'Codigo confirmado' }));
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const parsed = resetPasswordSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(formatValidationError(parsed.error), 400);
    }

    await emailAuthService.resetPassword({
      usuario: parsed.data.usuario,
      resetToken: parsed.data.resetToken,
      novaSenha: parsed.data.novaSenha
    });

    return response.status(200).json(
      apiResponse(
        { reset: true },
        { message: 'Senha alterada com sucesso' }
      )
    );
  } catch (error) {
    return next(error);
  }
}
