import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { SchoolLogo } from '../components/ui/SchoolLogo';
import { useAuth } from '../contexts/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import './Login.css';

type LoginErrors = Partial<Record<keyof LoginFormData | 'form', string>>;

function zodErrorsToFormErrors(error: ZodError): LoginErrors {
  return error.issues.reduce<LoginErrors>((errors, issue) => {
    const field = issue.path[0] as keyof LoginFormData | undefined;
    if (field) errors[field] = issue.message;
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
    if (isAuthenticated) navigate('/home', { replace: true });
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
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: { message?: string } } }
      ).response;

      if (
        response?.status === 403 &&
        response.data?.message?.toLowerCase().includes('confirme seu e-mail')
      ) {
        navigate(
          `/verificar-email?usuario=${encodeURIComponent(formData.usuario.trim())}`,
        );
        return;
      }

      setErrors({
        form:
          response?.data?.message ||
          'Não foi possível entrar. Confira usuário e senha.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoading && isAuthenticated) return <Navigate replace to="/home" />;

  return (
    <main className="login-v15">
      <motion.div
        className="login-v15__scene"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <section className="login-v15__form-side">
          <div className="login-v15__brand">
            <span className="login-v15__logo"><SchoolLogo /></span>
            <span>
              <strong>Portal Hormezinda</strong>
              <small>Comunidade escolar</small>
            </span>
          </div>

          <div className="login-v15__form-wrap">
            <div className="login-v15__kicker"><Sparkles /> Acesso ao portal</div>
            <h1>Bem-vindo<br />de volta</h1>
            <p>Entre com seu usuário e senha para continuar.</p>

            <form noValidate onSubmit={handleSubmit}>
              <label className="login-v15__field" htmlFor="usuario">
                <span>Usuário</span>
                <div className="login-v15__input">
                  <UserRound />
                  <input
                    id="usuario"
                    name="usuario"
                    autoComplete="username"
                    autoFocus
                    disabled={isSubmitting}
                    placeholder="seu.usuario"
                    value={formData.usuario}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, usuario: event.target.value }));
                      setErrors((current) => ({ ...current, usuario: undefined, form: undefined }));
                    }}
                  />
                </div>
                {errors.usuario ? <span className="login-v15__error"><TriangleAlert />{errors.usuario}</span> : null}
              </label>

              <label className="login-v15__field" htmlFor="senha">
                <span>Senha</span>
                <div className="login-v15__input">
                  <LockKeyhole />
                  <input
                    id="senha"
                    name="senha"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    placeholder="Sua senha"
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, senha: event.target.value }));
                      setErrors((current) => ({ ...current, senha: undefined, form: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setIsPasswordVisible((current) => !current)}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.senha ? <span className="login-v15__error"><TriangleAlert />{errors.senha}</span> : null}
              </label>

              <div className="login-v15__forgot"><Link to="/esqueci-senha">Esqueci minha senha</Link></div>

              {errors.form ? <div className="login-v15__alert"><TriangleAlert />{errors.form}</div> : null}

              <button
                className="login-v15__submit"
                disabled={isSubmitting}
                type="submit"
              >
                <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
                {isSubmitting ? <LoaderCircle className="login-v15__spin" /> : <ArrowRight />}
              </button>
            </form>
            <div className="login-v15__safe"><ShieldCheck /> Acesso protegido ao Portal Hormezinda</div>
          </div>

          <footer>Tecnologia, educação e comunidade.</footer>
        </section>

        <aside className="login-v15__art" aria-label="Ambiente escolar ilustrado">
          <div className="login-v15__art-image" />
        </aside>
      </motion.div>
    </main>
  );
}
