import nodemailer from 'nodemailer';

type CodePurpose = 'verify_email' | 'reset_password';

const CODE_TTL_MINUTES = 10;

function transporter() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Credenciais de e-mail nao configuradas.');
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT || 465),
    secure:
      String(process.env.MAIL_SECURE ?? 'true').toLowerCase() !== 'false',
    auth: { user, pass }
  });
}

export async function sendAuthCodeEmail(input: {
  to: string;
  code: string;
  nomeCompleto?: string;
  purpose: CodePurpose;
}): Promise<void> {
  const verification = input.purpose === 'verify_email';
  const title = verification ? 'Confirme seu e-mail' : 'Recuperacao de senha';
  const subject = verification
    ? 'Confirme seu e-mail - Portal Hormezinda'
    : 'Codigo para redefinir sua senha - Portal Hormezinda';
  const description = verification
    ? 'Use o codigo abaixo para confirmar seu e-mail e liberar seu primeiro acesso ao Portal.'
    : 'Use o codigo abaixo para continuar a redefinicao da sua senha.';

  await transporter().sendMail({
    from: `"Portal Hormezinda" <${process.env.MAIL_USER}>`,
    to: input.to,
    subject,
    text: [
      'Portal Hormezinda',
      '',
      input.nomeCompleto ? `Ola, ${input.nomeCompleto}.` : 'Ola.',
      description,
      '',
      `Codigo: ${input.code}`,
      '',
      `Este codigo expira em ${CODE_TTL_MINUTES} minutos.`,
      'Se voce nao solicitou esta acao, ignore esta mensagem.'
    ].join('\n'),
    html: `
      <div style="background:#f4f8fb;padding:34px 14px;font-family:Arial,Helvetica,sans-serif;color:#0a1931">
        <div style="max-width:560px;margin:0 auto;overflow:hidden;border:1px solid #d9e7f0;border-radius:24px;background:#fff;box-shadow:0 20px 48px rgba(10,25,49,.10)">
          <div style="padding:25px 30px;background:linear-gradient(135deg,#0a1931,#1a3d63 55%,#168fc5);color:#fff">
            <div style="font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;opacity:.82">Portal Hormezinda</div>
            <div style="margin-top:8px;font-size:25px;font-weight:900">${title}</div>
          </div>
          <div style="padding:30px">
            <p style="margin:0 0 8px;font-size:16px;line-height:1.6">${input.nomeCompleto ? `Ola, ${input.nomeCompleto}.` : 'Ola.'}</p>
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
  });
}
