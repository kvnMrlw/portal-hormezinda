type CodePurpose = 'verify_email' | 'reset_password';

type MailConfig = {
  apiKey: string;
  fromEmail: string;
  fromName: string;
};

type BrevoErrorPayload = {
  code?: unknown;
  message?: unknown;
};

const CODE_TTL_MINUTES = 10;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 15_000;

function requireMailEnv(name: 'BREVO_API_KEY' | 'MAIL_FROM_EMAIL'): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Configuracao de e-mail incompleta: ${name} nao configurada.`);
  }

  return value;
}

function getMailConfig(): MailConfig {
  return {
    apiKey: requireMailEnv('BREVO_API_KEY'),
    fromEmail: requireMailEnv('MAIL_FROM_EMAIL'),
    fromName: process.env.MAIL_FROM_NAME?.trim() || 'Portal Hormezinda'
  };
}

function escapeHtml(value: string): string {
  const replacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return value.replace(/[&<>"']/g, (character) => replacements[character] ?? character);
}

async function getBrevoErrorDetail(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as BrevoErrorPayload;
    const code = typeof payload.code === 'string' ? payload.code.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    const detail = [code, message].filter(Boolean).join(': ').replace(/\s+/g, ' ');
    return detail.slice(0, 180);
  } catch {
    return '';
  }
}

export async function sendAuthCodeEmail(input: {
  to: string;
  code: string;
  nomeCompleto?: string;
  purpose: CodePurpose;
}): Promise<void> {
  const config = getMailConfig();
  const verification = input.purpose === 'verify_email';
  const title = verification ? 'Confirme seu e-mail' : 'Recuperacao de senha';
  const subject = verification
    ? 'Confirme seu e-mail - Portal Hormezinda'
    : 'Codigo para redefinir sua senha - Portal Hormezinda';
  const description = verification
    ? 'Use o codigo abaixo para confirmar seu e-mail e liberar seu primeiro acesso ao Portal.'
    : 'Use o codigo abaixo para continuar a redefinicao da sua senha.';
  const textGreeting = input.nomeCompleto ? `Ola, ${input.nomeCompleto}.` : 'Ola.';
  const htmlGreeting = input.nomeCompleto
    ? `Ola, ${escapeHtml(input.nomeCompleto)}.`
    : 'Ola.';

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': config.apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        email: config.fromEmail,
        name: config.fromName
      },
      to: [{ email: input.to }],
      subject,
      textContent: [
        'Portal Hormezinda',
        '',
        textGreeting,
        description,
        '',
        `Codigo: ${input.code}`,
        '',
        `Este codigo expira em ${CODE_TTL_MINUTES} minutos.`,
        'Se voce nao solicitou esta acao, ignore esta mensagem.'
      ].join('\n'),
      htmlContent: `
        <div style="background:#f4f8fb;padding:34px 14px;font-family:Arial,Helvetica,sans-serif;color:#0a1931">
          <div style="max-width:560px;margin:0 auto;overflow:hidden;border:1px solid #d9e7f0;border-radius:24px;background:#fff;box-shadow:0 20px 48px rgba(10,25,49,.10)">
            <div style="padding:25px 30px;background:linear-gradient(135deg,#0a1931,#1a3d63 55%,#168fc5);color:#fff">
              <div style="font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;opacity:.82">Portal Hormezinda</div>
              <div style="margin-top:8px;font-size:25px;font-weight:900">${title}</div>
            </div>
            <div style="padding:30px">
              <p style="margin:0 0 8px;font-size:16px;line-height:1.6">${htmlGreeting}</p>
              <p style="margin:0 0 24px;color:#637b90;font-size:15px;line-height:1.65">${description}</p>
              <div style="padding:23px 20px;border:1px solid #cae5f3;border-radius:18px;background:#eef8fd;text-align:center">
                <div style="color:#668398;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase">Seu codigo</div>
                <div style="margin-top:9px;color:#086caa;font-size:38px;font-weight:900;letter-spacing:.25em">${input.code}</div>
              </div>
              <p style="margin:23px 0 0;color:#778d9f;font-size:13px;line-height:1.6">
                O codigo expira em ${CODE_TTL_MINUTES} minutos.
                Se voce nao solicitou esta acao, ignore este e-mail.
              </p>
            </div>
          </div>
        </div>
      `
    }),
    signal: AbortSignal.timeout(BREVO_TIMEOUT_MS)
  });

  if (!response.ok) {
    const detail = await getBrevoErrorDetail(response);
    const suffix = detail ? ` - ${detail}` : '';
    throw new Error(`Falha ao enviar e-mail pela Brevo (HTTP ${response.status})${suffix}`);
  }
}
