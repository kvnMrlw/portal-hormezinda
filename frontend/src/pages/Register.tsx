import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { SchoolLogo } from '../components/ui/SchoolLogo';
import { useAuth } from '../contexts/useAuth';
import {
  normalizeDateInput,
  registerSchema,
  registerStepFourSchema,
  registerStepOneSchema,
  registerStepThreeSchema,
  registerStepTwoSchema,
  type RegisterFormData,
} from '../schemas/auth.schema';
import { Turno, Turma, turmasPorTurno } from '../types/auth';
import './Login.css';
import './Register.css';

type RegisterErrors = Partial<Record<keyof RegisterFormData | 'form', string>>;

const initialFormData: RegisterFormData = {
  nomeCompleto: '',
  dataNascimento: '',
  email: '',
  turno: Turno.MATUTINO,
  turma: Turma.PRIMEIRO_A,
  usuario: '',
  senha: '',
  confirmarSenha: '',
};

function zodErrorsToFormErrors(error: ZodError): RegisterErrors {
  return error.issues.reduce<RegisterErrors>((errors, issue) => {
    const field = issue.path[0] as keyof RegisterFormData | undefined;
    if (field) errors[field] = issue.message;
    return errors;
  }, {});
}

function apiMessage(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
}

export function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const availableTurmas = useMemo(() => turmasPorTurno[formData.turno], [formData.turno]);

  useEffect(() => {
    if (isAuthenticated) navigate('/home', { replace: true });
  }, [isAuthenticated, navigate]);

  function updateField<TField extends keyof RegisterFormData>(field: TField, value: RegisterFormData[TField]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validateCurrentStep(): boolean {
    const schemas = [registerStepOneSchema, registerStepTwoSchema, registerStepThreeSchema, registerStepFourSchema];
    const parsedData = schemas[step - 1].safeParse(formData);
    if (!parsedData.success) {
      setErrors(zodErrorsToFormErrors(parsedData.error));
      return false;
    }
    setErrors({});
    return true;
  }

  function handleNext() {
    if (validateCurrentStep()) setStep((current) => Math.min(current + 1, 4));
  }

  function handleBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    const parsedData = registerSchema.safeParse(formData);
    if (!parsedData.success) {
      setErrors(zodErrorsToFormErrors(parsedData.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        nomeCompleto: parsedData.data.nomeCompleto,
        email: parsedData.data.email,
        usuario: parsedData.data.usuario,
        senha: parsedData.data.senha,
        dataNascimento: normalizeDateInput(parsedData.data.dataNascimento),
        turno: parsedData.data.turno,
        turma: parsedData.data.turma,
      });
      navigate(`/verificar-email?usuario=${encodeURIComponent(parsedData.data.usuario)}`, { replace: true });
    } catch (error) {
      setErrors({ form: apiMessage(error, 'Não foi possível cadastrar. Confira os dados e tente novamente.') });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoading && isAuthenticated) return <Navigate replace to="/home" />;

  return (
    <main className="login-v15 register-v27">
      <motion.div animate={{ opacity: 1 }} className="login-v15__scene" initial={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        <section className="login-v15__form-side register-v27__form-side">
          <div className="login-v15__brand">
            <span className="login-v15__logo"><SchoolLogo /></span>
            <span><strong>Portal Hormezinda</strong><small>Comunidade escolar</small></span>
          </div>

          <div className="login-v15__form-wrap register-v27__form-wrap">
            <div className="register-v27__topline">
              <div className="login-v15__kicker register-v27__kicker"><Sparkles />Criar acesso</div>
              <Link className="register-v27__login-link" to="/login">Já tenho conta</Link>
            </div>

            <h1>Crie sua<br />conta</h1>

            <div className="register-v27__intro">
              <p>Preencha seus dados. Seu e-mail será confirmado antes do primeiro acesso.</p>
              <div className="register-v27__progress" aria-label={`Etapa ${step} de 4`}>
                {[1, 2, 3, 4].map((item) => (
                  <span className={['register-v27__progress-step', item < step ? 'is-done' : '', item === step ? 'is-active' : ''].filter(Boolean).join(' ')} key={item}>
                    {item < step ? <Check /> : item}
                  </span>
                ))}
              </div>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div className="register-v27__step-header">
                <span>Etapa {step} de 4</span>
                <strong>{step === 1 ? 'Seus dados' : step === 2 ? 'Seu turno' : step === 3 ? 'Sua turma' : 'Seu acesso'}</strong>
              </div>

              {step === 1 ? (
                <div className="register-v27__fields">
                  <label className="login-v15__field" htmlFor="nomeCompleto">
                    <span>Nome completo</span>
                    <div className="login-v15__input"><UserRound /><input autoComplete="name" autoFocus disabled={isSubmitting} id="nomeCompleto" name="nomeCompleto" placeholder="Seu nome completo" value={formData.nomeCompleto} onChange={(event) => updateField('nomeCompleto', event.target.value)} /></div>
                    {errors.nomeCompleto ? <span className="login-v15__error"><TriangleAlert />{errors.nomeCompleto}</span> : null}
                  </label>

                  <label className="login-v15__field" htmlFor="dataNascimento">
                    <span>Data de nascimento</span>
                    <div className="login-v15__input register-v27__date-input"><CalendarDays /><input disabled={isSubmitting} id="dataNascimento" max={new Date().toISOString().split('T')[0]} name="dataNascimento" type="date" value={formData.dataNascimento} onChange={(event) => updateField('dataNascimento', event.target.value)} /></div>
                    {errors.dataNascimento ? <span className="login-v15__error"><TriangleAlert />{errors.dataNascimento}</span> : null}
                  </label>

                  <label className="login-v15__field" htmlFor="email">
                    <span>E-mail</span>
                    <div className="login-v15__input"><Mail /><input autoComplete="email" disabled={isSubmitting} id="email" inputMode="email" name="email" placeholder="voce@gmail.com" type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} /></div>
                    {errors.email ? <span className="login-v15__error"><TriangleAlert />{errors.email}</span> : null}
                  </label>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="register-v27__choice-grid register-v27__choice-grid--turno">
                  {[Turno.MATUTINO, Turno.VESPERTINO].map((turno) => (
                    <button className={`register-v27__choice ${formData.turno === turno ? 'is-selected' : ''}`} key={turno} onClick={() => { updateField('turno', turno); updateField('turma', turmasPorTurno[turno][0]); }} type="button">
                      <span className="register-v27__choice-icon"><GraduationCap /></span>
                      <span><strong>{turno}</strong><small>{turno === Turno.MATUTINO ? 'Aulas no período da manhã' : 'Aulas no período da tarde'}</small></span>
                      <span className="register-v27__choice-check"><Check /></span>
                    </button>
                  ))}
                  {errors.turno ? <span className="login-v15__error register-v27__wide-error"><TriangleAlert />{errors.turno}</span> : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="register-v27__class-wrap">
                  <p className="register-v27__helper">Escolha sua turma do período {formData.turno.toLowerCase()}.</p>
                  <div className="register-v27__class-grid">
                    {availableTurmas.map((turma) => (
                      <button className={`register-v27__class-button ${formData.turma === turma ? 'is-selected' : ''}`} key={turma} onClick={() => updateField('turma', turma)} type="button"><span>{turma}</span><Check /></button>
                    ))}
                  </div>
                  {errors.turma ? <span className="login-v15__error"><TriangleAlert />{errors.turma}</span> : null}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="register-v27__fields register-v27__fields--access">
                  <label className="login-v15__field" htmlFor="usuario">
                    <span>Usuário</span>
                    <div className="login-v15__input"><UserRound /><input autoComplete="username" autoFocus disabled={isSubmitting} id="usuario" name="usuario" placeholder="seu.usuario" value={formData.usuario} onChange={(event) => updateField('usuario', event.target.value)} /></div>
                    {errors.usuario ? <span className="login-v15__error"><TriangleAlert />{errors.usuario}</span> : null}
                  </label>

                  <label className="login-v15__field" htmlFor="senha">
                    <span>Senha</span>
                    <div className="login-v15__input"><LockKeyhole /><input autoComplete="new-password" disabled={isSubmitting} id="senha" name="senha" placeholder="Crie uma senha" type={showPassword ? 'text' : 'password'} value={formData.senha} onChange={(event) => updateField('senha', event.target.value)} /><button aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((current) => !current)} type="button">{showPassword ? <EyeOff /> : <Eye />}</button></div>
                    {errors.senha ? <span className="login-v15__error"><TriangleAlert />{errors.senha}</span> : null}
                  </label>

                  <label className="login-v15__field" htmlFor="confirmarSenha">
                    <span>Confirmar senha</span>
                    <div className="login-v15__input"><LockKeyhole /><input autoComplete="new-password" disabled={isSubmitting} id="confirmarSenha" name="confirmarSenha" placeholder="Digite a senha novamente" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmarSenha} onChange={(event) => updateField('confirmarSenha', event.target.value)} /><button aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} onClick={() => setShowConfirmPassword((current) => !current)} type="button">{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div>
                    {errors.confirmarSenha ? <span className="login-v15__error"><TriangleAlert />{errors.confirmarSenha}</span> : null}
                  </label>
                </div>
              ) : null}

              {errors.form ? <div className="login-v15__alert"><TriangleAlert />{errors.form}</div> : null}

              <div className="register-v27__actions">
                {step > 1 ? <button className="register-v27__back" disabled={isSubmitting} onClick={handleBack} type="button"><ArrowLeft /><span>Voltar</span></button> : <Link className="register-v27__back" to="/"><ArrowLeft /><span>Voltar</span></Link>}
                {step < 4 ? <button className="login-v15__submit register-v27__next" disabled={isSubmitting} onClick={handleNext} type="button"><span>Continuar</span><ArrowRight /></button> : <button className="login-v15__submit register-v27__next" disabled={isSubmitting} type="submit"><span>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</span>{isSubmitting ? <LoaderCircle className="login-v15__spin" /> : <CheckCircle2 />}</button>}
              </div>
            </form>

            <div className="login-v15__safe"><ShieldCheck />Cadastro protegido pelo Portal Hormezinda</div>
          </div>
          <footer>Tecnologia, educação e comunidade.</footer>
        </section>

        <aside className="login-v15__art" aria-label="Ambiente escolar ilustrado"><div className="login-v15__art-image" /></aside>
      </motion.div>
    </main>
  );
}
