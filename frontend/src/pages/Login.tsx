import {
  ArrowRight,
  Atom,
  Backpack,
  BookOpen,
  Calculator,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  Ruler,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type ComponentType, type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { SchoolLogo } from '../components/ui/SchoolLogo';
import { useAuth } from '../contexts/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import './Login.css';

type LoginErrors = Partial<Record<keyof LoginFormData | 'form', string>>;
type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

const backgroundIcons: Array<{ Icon: IconComponent; className: string }> = [
  { Icon: BookOpen, className: 'login-bg-icon login-bg-icon-book' },
  { Icon: Pencil, className: 'login-bg-icon login-bg-icon-pencil' },
  { Icon: Ruler, className: 'login-bg-icon login-bg-icon-ruler' },
  { Icon: Calculator, className: 'login-bg-icon login-bg-icon-calculator' },
  { Icon: Atom, className: 'login-bg-icon login-bg-icon-atom' },
  { Icon: Backpack, className: 'login-bg-icon login-bg-icon-backpack' },
];

function zodErrorsToFormErrors(error: ZodError): LoginErrors {
  return error.issues.reduce<LoginErrors>((errors, issue) => {
    const field = issue.path[0] as keyof LoginFormData | undefined;

    if (field) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({ usuario: '', senha: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const parsedData = loginSchema.safeParse(formData);

    if (!parsedData.success) {
      setErrors(zodErrorsToFormErrors(parsedData.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await login(parsedData.data);
      navigate('/home', { replace: true });
    } catch {
      setErrors({ form: 'Nao foi possivel entrar. Confira usuario e senha.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate replace to="/home" />;
  }

  const usuarioErrorId = errors.usuario ? 'usuario-error' : undefined;
  const senhaErrorId = errors.senha ? 'senha-error' : undefined;

  return (
    <main className="login-page">
      <div className="login-grid" />
      <div className="login-circle login-circle-top" />
      <div className="login-circle login-circle-bottom" />
      <div className="login-line login-line-left" />
      <div className="login-line login-line-right" />

      <svg aria-hidden="true" className="login-geometry" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <path d="M72 706C246 598 348 648 508 526C668 402 756 274 948 302C1110 326 1220 250 1376 136" />
        <path d="M116 214H286L364 138H516" />
        <path d="M1008 720H1142L1200 654H1334" />
      </svg>

      {backgroundIcons.map(({ Icon, className }) => (
        <Icon aria-hidden="true" className={className} key={className} strokeWidth={1.2} />
      ))}

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="login-logo-halo">
          <div className="login-logo">
            <SchoolLogo />
          </div>
        </div>

        <div className="login-heading">
          <h1>Portal Hormezinda</h1>
          <p className="login-kicker">Portal Escolar</p>
          <p className="login-description">Utilize seu usuario e senha para acessar o portal.</p>
        </div>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="login-field" htmlFor="usuario">
            <span>Usuario</span>
            <div className="login-input-shell">
              <UserRound className="login-input-icon" />
              <input
                aria-describedby={usuarioErrorId}
                aria-invalid={Boolean(errors.usuario)}
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                id="usuario"
                name="usuario"
                onChange={(event) => {
                  setFormData((current) => ({ ...current, usuario: event.target.value }));
                  setErrors((current) => ({ ...current, usuario: undefined, form: undefined }));
                }}
                placeholder="seu.usuario"
                value={formData.usuario}
              />
            </div>
            {errors.usuario ? (
              <span className="login-error" id="usuario-error">
                <TriangleAlert />
                {errors.usuario}
              </span>
            ) : null}
          </label>

          <label className="login-field" htmlFor="senha">
            <span>Senha</span>
            <div className="login-input-shell">
              <LockKeyhole className="login-input-icon" />
              <input
                aria-describedby={senhaErrorId}
                aria-invalid={Boolean(errors.senha)}
                autoComplete="current-password"
                disabled={isSubmitting}
                id="senha"
                name="senha"
                onChange={(event) => {
                  setFormData((current) => ({ ...current, senha: event.target.value }));
                  setErrors((current) => ({ ...current, senha: undefined, form: undefined }));
                }}
                placeholder="Sua senha"
                type={isPasswordVisible ? 'text' : 'password'}
                value={formData.senha}
              />
              <button
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                className="login-visibility-button"
                disabled={isSubmitting}
                onClick={() => setIsPasswordVisible((current) => !current)}
                type="button"
              >
                {isPasswordVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.senha ? (
              <span className="login-error" id="senha-error">
                <TriangleAlert />
                {errors.senha}
              </span>
            ) : null}
          </label>

          <div className="login-forgot-row">
            <a href="#" onClick={(event) => event.preventDefault()}>
              Esqueci minha senha
            </a>
          </div>

          {errors.form ? (
            <p className="login-alert" role="alert">
              <TriangleAlert />
              <span>{errors.form}</span>
            </p>
          ) : null}

          <button className="login-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? <LoaderCircle className="login-spin" /> : <ArrowRight />}
            <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
          </button>
        </form>

        <div className="login-safe-box">
          <ShieldCheck />
          <span>Acesso seguro ao Portal Hormezinda</span>
        </div>
      </motion.section>
    </main>
  );
}
