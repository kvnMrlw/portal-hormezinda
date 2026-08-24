import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MailCheck,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { SchoolLogo } from '../components/ui/SchoolLogo';
import { api } from '../services/api';
import './Login.css';
import './AuthFlow.css';

interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

function apiMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message || fallback
  );
}

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialUser = useMemo(
    () => searchParams.get('usuario')?.trim() || '',
    [searchParams],
  );

  const [usuario, setUsuario] = useState(initialUser);
  const [codigo, setCodigo] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialUser ? 60 : 0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    if (!usuario.trim() || resending || cooldown > 0) return;

    try {
      setError('');
      setSuccess('');
      setResending(true);

      const response = await api.post<
        ApiEnvelope<{
          emailMascarado: string;
          alreadyVerified: boolean;
          resendIn: number;
        }>
      >('/auth/email/send-verification', {
        usuario: usuario.trim(),
      });

      setEmailMascarado(response.data.data.emailMascarado || '');

      if (response.data.data.alreadyVerified) {
        setSuccess('Este e-mail já está confirmado. Abrindo o login...');
        window.setTimeout(() => navigate('/login', { replace: true }), 900);
        return;
      }

      setSuccess('Novo código enviado.');
      setCooldown(response.data.data.resendIn || 60);
    } catch (requestError) {
      setError(
        apiMessage(requestError, 'Não foi possível reenviar o código agora.'),
      );
    } finally {
      setResending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuario.trim()) {
      setError('Informe seu usuário.');
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setError('Digite os 6 números do código.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setBusy(true);

      const response = await api.post<
        ApiEnvelope<{ verified: boolean; emailMascarado: string }>
      >('/auth/email/verify', {
        usuario: usuario.trim(),
        codigo,
      });

      setEmailMascarado(response.data.data.emailMascarado || '');
      setSuccess('E-mail confirmado. Abrindo a tela de entrada...');

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 900);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Código inválido ou expirado.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-v15 auth-flow-v29">
      <motion.div
        animate={{ opacity: 1 }}
        className="login-v15__scene"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <section className="login-v15__form-side">
          <div className="login-v15__brand">
            <span className="login-v15__logo">
              <SchoolLogo />
            </span>
            <span>
              <strong>Portal Hormezinda</strong>
              <small>Comunidade escolar</small>
            </span>
          </div>

          <div className="login-v15__form-wrap auth-flow-v29__wrap">
            <div className="login-v15__kicker">
              <Sparkles />
              Verificação de e-mail
            </div>

            <h1>
              Confirme seu
              <br />
              e-mail
            </h1>

            <p>Digite o código de 6 números enviado para o endereço cadastrado.</p>

            {emailMascarado ? (
              <div className="auth-flow-v29__mail-card">
                <MailCheck />
                <span>
                  Código enviado para
                  <strong>{emailMascarado}</strong>
                </span>
              </div>
            ) : null}

            <form noValidate onSubmit={submit}>
              {!initialUser ? (
                <label className="login-v15__field" htmlFor="verify-user">
                  <span>Usuário</span>
                  <div className="login-v15__input">
                    <UserRound />
                    <input
                      autoFocus
                      id="verify-user"
                      onChange={(event) => setUsuario(event.target.value)}
                      placeholder="seu.usuario"
                      value={usuario}
                    />
                  </div>
                </label>
              ) : null}

              <label className="login-v15__field" htmlFor="verify-code">
                <span>Código de confirmação</span>
                <div className="login-v15__input auth-flow-v29__code">
                  <input
                    autoComplete="one-time-code"
                    autoFocus={Boolean(initialUser)}
                    id="verify-code"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) =>
                      setCodigo(
                        event.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    value={codigo}
                  />
                </div>
              </label>

              {error ? (
                <div className="login-v15__alert">
                  <TriangleAlert />
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="auth-flow-v29__success">
                  <CheckCircle2 />
                  {success}
                </div>
              ) : null}

              <button
                className="login-v15__submit"
                disabled={busy}
                type="submit"
              >
                <span>{busy ? 'Confirmando...' : 'Confirmar e-mail'}</span>
                {busy ? (
                  <LoaderCircle className="login-v15__spin" />
                ) : (
                  <ArrowRight />
                )}
              </button>

              <button
                className="auth-flow-v29__text-button"
                disabled={resending || cooldown > 0 || !usuario.trim()}
                onClick={() => void resend()}
                type="button"
              >
                {resending
                  ? 'Enviando...'
                  : cooldown > 0
                    ? `Reenviar código em ${cooldown}s`
                    : 'Reenviar código'}
              </button>
            </form>

            <div className="login-v15__safe">
              <ShieldCheck />
              Código protegido e válido por 10 minutos
            </div>

            <Link className="auth-flow-v29__back" to="/login">
              <ArrowLeft />
              Voltar para entrar
            </Link>
          </div>

          <footer>Tecnologia, educação e comunidade.</footer>
        </section>

        <aside
          className="login-v15__art"
          aria-label="Ambiente escolar ilustrado"
        >
          <div className="login-v15__art-image" />
        </aside>
      </motion.div>
    </main>
  );
}
