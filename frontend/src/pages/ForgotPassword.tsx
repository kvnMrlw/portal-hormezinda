import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { RecaptchaCheckbox } from '../components/auth/RecaptchaCheckbox';
import { SchoolLogo } from '../components/ui/SchoolLogo';
import { api } from '../services/api';
import './Login.css';
import './AuthFlow.css';

type Stage = 'identify' | 'code' | 'password' | 'success';

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

export function ForgotPassword() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('identify');
  const [usuario, setUsuario] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  function resetCaptcha() {
    setCaptchaToken('');
    setCaptchaReset((current) => current + 1);
  }

  async function startRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuario.trim()) {
      setError('Informe seu usuário.');
      return;
    }

    if (!captchaToken) {
      setError('Marque a opção "Não sou um robô".');
      return;
    }

    try {
      setBusy(true);
      setError('');
      setSuccess('');

      const response = await api.post<
        ApiEnvelope<{
          emailMascarado: string;
          resendIn: number;
          expiresIn: number;
        }>
      >('/auth/password/forgot', {
        usuario: usuario.trim(),
        captchaToken,
      });

      setUsuario(usuario.trim());
      setEmailMascarado(response.data.data.emailMascarado);
      setCooldown(response.data.data.resendIn || 60);
      setStage('code');
      setSuccess('Código enviado para seu e-mail.');
      resetCaptcha();
    } catch (requestError) {
      const response = (
        requestError as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        }
      ).response;

      resetCaptcha();

      if (
        response?.status === 403 &&
        response.data?.message?.toLowerCase().includes('não foi confirmado')
      ) {
        navigate(
          `/verificar-email?usuario=${encodeURIComponent(usuario.trim())}`,
        );
        return;
      }

      setError(
        apiMessage(
          requestError,
          'Não foi possível iniciar a recuperação da conta.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (busy || cooldown > 0) return;

    if (!captchaToken) {
      setError('Marque a opção "Não sou um robô" para reenviar.');
      return;
    }

    try {
      setBusy(true);
      setError('');
      setSuccess('');

      const response = await api.post<
        ApiEnvelope<{
          emailMascarado: string;
          resendIn: number;
          expiresIn: number;
        }>
      >('/auth/password/forgot', {
        usuario,
        captchaToken,
      });

      setEmailMascarado(response.data.data.emailMascarado);
      setCooldown(response.data.data.resendIn || 60);
      setSuccess('Novo código enviado para seu e-mail.');
      resetCaptcha();
    } catch (requestError) {
      resetCaptcha();

      setError(
        apiMessage(
          requestError,
          'Não foi possível reenviar o código de recuperação.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(codigo)) {
      setError('Digite os 6 números do código.');
      return;
    }

    try {
      setBusy(true);
      setError('');
      setSuccess('');

      const response = await api.post<
        ApiEnvelope<{ resetToken: string; expiresIn: number }>
      >('/auth/password/verify-code', {
        usuario,
        codigo,
      });

      setResetToken(response.data.data.resetToken);
      setStage('password');
    } catch (requestError) {
      setError(
        apiMessage(requestError, 'Código inválido ou expirado.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      novaSenha.length < 8 ||
      !/[A-Za-z]/.test(novaSenha) ||
      !/\d/.test(novaSenha)
    ) {
      setError(
        'A senha precisa ter 8 caracteres, pelo menos 1 letra e 1 número.',
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      setBusy(true);
      setError('');

      await api.post('/auth/password/reset', {
        usuario,
        resetToken,
        novaSenha,
        confirmarSenha,
      });

      setStage('success');
    } catch (requestError) {
      setError(
        apiMessage(requestError, 'Não foi possível alterar a senha.'),
      );
    } finally {
      setBusy(false);
    }
  }

  const title =
    stage === 'identify'
      ? 'Recupere sua conta'
      : stage === 'code'
        ? 'Digite o código'
        : stage === 'password'
          ? 'Crie uma nova senha'
          : 'Senha alterada';

  const subtitle =
    stage === 'identify'
      ? 'Informe seu usuário e confirme que você é uma pessoa.'
      : stage === 'code'
        ? 'Digite os 6 números que enviamos para seu e-mail.'
        : stage === 'password'
          ? 'Escolha uma nova senha para voltar a acessar o Portal.'
          : 'Sua conta está pronta para entrar com a nova senha.';

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
              Recuperação de acesso
            </div>

            <h1>{title}</h1>
            <p>{subtitle}</p>

            {stage === 'identify' ? (
              <form noValidate onSubmit={startRecovery}>
                <label
                  className="login-v15__field"
                  htmlFor="forgot-user"
                >
                  <span>Usuário</span>
                  <div className="login-v15__input">
                    <UserRound />
                    <input
                      autoComplete="username"
                      autoFocus
                      id="forgot-user"
                      onChange={(event) =>
                        setUsuario(event.target.value)
                      }
                      placeholder="seu.usuario"
                      value={usuario}
                    />
                  </div>
                </label>

                <RecaptchaCheckbox
                  onChange={setCaptchaToken}
                  resetSignal={captchaReset}
                />

                {error ? (
                  <div className="login-v15__alert">
                    <TriangleAlert />
                    {error}
                  </div>
                ) : null}

                <button
                  className="login-v15__submit"
                  disabled={busy || !captchaToken}
                  type="submit"
                >
                  <span>
                    {busy ? 'Enviando...' : 'Enviar código'}
                  </span>
                  {busy ? (
                    <LoaderCircle className="login-v15__spin" />
                  ) : (
                    <ArrowRight />
                  )}
                </button>
              </form>
            ) : null}

            {stage === 'code' ? (
              <form noValidate onSubmit={verifyCode}>
                <div className="auth-flow-v29__mail-card">
                  <Mail />
                  <span>
                    Enviado para
                    <strong>{emailMascarado}</strong>
                  </span>
                </div>

                <label
                  className="login-v15__field"
                  htmlFor="reset-code"
                >
                  <span>Código de recuperação</span>
                  <div className="login-v15__input auth-flow-v29__code">
                    <KeyRound />
                    <input
                      autoComplete="one-time-code"
                      autoFocus
                      id="reset-code"
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) =>
                        setCodigo(
                          event.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6),
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
                  <span>
                    {busy ? 'Validando...' : 'Validar código'}
                  </span>
                  {busy ? (
                    <LoaderCircle className="login-v15__spin" />
                  ) : (
                    <ArrowRight />
                  )}
                </button>

                {cooldown <= 0 ? (
                  <RecaptchaCheckbox
                    onChange={setCaptchaToken}
                    resetSignal={captchaReset}
                  />
                ) : null}

                <button
                  className="auth-flow-v29__text-button"
                  disabled={
                    busy ||
                    cooldown > 0 ||
                    !captchaToken
                  }
                  onClick={() => void resendCode()}
                  type="button"
                >
                  {cooldown > 0
                    ? `Reenviar código em ${cooldown}s`
                    : 'Reenviar código'}
                </button>
              </form>
            ) : null}

            {stage === 'password' ? (
              <form noValidate onSubmit={changePassword}>
                <label
                  className="login-v15__field"
                  htmlFor="new-password"
                >
                  <span>Nova senha</span>
                  <div className="login-v15__input">
                    <LockKeyhole />
                    <input
                      autoComplete="new-password"
                      autoFocus
                      id="new-password"
                      onChange={(event) =>
                        setNovaSenha(event.target.value)
                      }
                      placeholder="Crie sua nova senha"
                      type={
                        showPassword ? 'text' : 'password'
                      }
                      value={novaSenha}
                    />
                    <button
                      aria-label={
                        showPassword
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      type="button"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>

                <label
                  className="login-v15__field"
                  htmlFor="confirm-new-password"
                >
                  <span>Confirmar nova senha</span>
                  <div className="login-v15__input">
                    <LockKeyhole />
                    <input
                      autoComplete="new-password"
                      id="confirm-new-password"
                      onChange={(event) =>
                        setConfirmarSenha(event.target.value)
                      }
                      placeholder="Digite novamente"
                      type={
                        showConfirm ? 'text' : 'password'
                      }
                      value={confirmarSenha}
                    />
                    <button
                      aria-label={
                        showConfirm
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                      onClick={() =>
                        setShowConfirm(
                          (current) => !current,
                        )
                      }
                      type="button"
                    >
                      {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>

                {error ? (
                  <div className="login-v15__alert">
                    <TriangleAlert />
                    {error}
                  </div>
                ) : null}

                <button
                  className="login-v15__submit"
                  disabled={busy}
                  type="submit"
                >
                  <span>
                    {busy ? 'Alterando...' : 'Alterar senha'}
                  </span>
                  {busy ? (
                    <LoaderCircle className="login-v15__spin" />
                  ) : (
                    <ArrowRight />
                  )}
                </button>
              </form>
            ) : null}

            {stage === 'success' ? (
              <div className="auth-flow-v29__success-screen">
                <span className="auth-flow-v29__success-icon">
                  <CheckCircle2 />
                </span>
                <strong>Senha alterada com sucesso</strong>
                <p>
                  Use sua nova senha para entrar no Portal
                  Hormezinda.
                </p>

                <button
                  className="login-v15__submit"
                  onClick={() =>
                    navigate('/login', { replace: true })
                  }
                  type="button"
                >
                  <span>Ir para o login</span>
                  <ArrowRight />
                </button>
              </div>
            ) : null}

            <div className="login-v15__safe">
              <ShieldCheck />
              Recuperação protegida por reCAPTCHA e código temporário
            </div>

            {stage !== 'success' ? (
              <Link
                className="auth-flow-v29__back"
                to="/login"
              >
                <ArrowLeft />
                Voltar para entrar
              </Link>
            ) : null}
          </div>

          <footer>
            Tecnologia, educação e comunidade.
          </footer>
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
