import https from 'https';

import { AppError } from '../../../middlewares/error.middleware';

type RecaptchaVerificationResponse = {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

function verifyWithGoogle(
  body: string
): Promise<RecaptchaVerificationResponse> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: 'www.google.com',
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 8000
      },
      (response) => {
        let raw = '';

        response.setEncoding('utf8');

        response.on('data', (chunk) => {
          raw += chunk;
        });

        response.on('end', () => {
          if (
            !response.statusCode ||
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            reject(
              new Error(
                `Google reCAPTCHA respondeu HTTP ${response.statusCode ?? 0}`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(raw) as RecaptchaVerificationResponse);
          } catch {
            reject(new Error('Resposta invalida do Google reCAPTCHA'));
          }
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(
        new Error('Tempo limite do Google reCAPTCHA excedido')
      );
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

export class RecaptchaService {
  async verify(tokenInput: string): Promise<void> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const token = tokenInput.trim();

    if (!secret) {
      throw new AppError(
        'reCAPTCHA nao esta configurado no servidor',
        503
      );
    }

    if (!token) {
      throw new AppError('Confirme que voce nao e um robo', 400);
    }

    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', token);

    let verification: RecaptchaVerificationResponse;

    try {
      verification = await verifyWithGoogle(params.toString());
    } catch (error) {
      console.error('[recaptcha] Falha ao consultar Google:', error);

      throw new AppError(
        'Nao foi possivel validar o reCAPTCHA agora. Tente novamente',
        503
      );
    }

    if (!verification.success) {
      throw new AppError(
        'A verificacao de seguranca expirou ou e invalida. Marque novamente "Nao sou um robo"',
        400
      );
    }

    const allowedHostnames = String(
      process.env.RECAPTCHA_ALLOWED_HOSTNAMES || 'localhost'
    )
      .split(',')
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean);

    const hostname = verification.hostname?.trim().toLowerCase();

    if (
      allowedHostnames.length > 0 &&
      hostname &&
      !allowedHostnames.includes(hostname)
    ) {
      console.warn(
        `[recaptcha] Hostname recusado: ${hostname}. Permitidos: ${allowedHostnames.join(', ')}`
      );

      throw new AppError(
        'Origem do reCAPTCHA nao autorizada',
        403
      );
    }
  }
}
