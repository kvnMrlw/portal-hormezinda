import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useAuth } from '../contexts/useAuth';
import {
  normalizeDateInput,
  registerSchema,
  registerStepFourSchema,
  registerStepOneSchema,
  registerStepThreeSchema,
  registerStepTwoSchema,
  type RegisterFormData
} from '../schemas/auth.schema';
import { Turno, Turma, turmasPorTurno } from '../types/auth';

type RegisterErrors = Partial<Record<keyof RegisterFormData | 'form', string>>;

const initialFormData: RegisterFormData = {
  nomeCompleto: '',
  dataNascimento: '',
  turno: Turno.MATUTINO,
  turma: Turma.PRIMEIRO_A,
  usuario: '',
  senha: '',
  confirmarSenha: ''
};

function zodErrorsToFormErrors(error: ZodError): RegisterErrors {
  return error.issues.reduce<RegisterErrors>((errors, issue) => {
    const field = issue.path[0] as keyof RegisterFormData | undefined;

    if (field) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

// Pagina de cadastro em etapas para novos alunos.
export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableTurmas = useMemo(() => turmasPorTurno[formData.turno], [formData.turno]);

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
    if (validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, 4));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedData = registerSchema.safeParse(formData);

    if (!parsedData.success) {
      setErrors(zodErrorsToFormErrors(parsedData.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        nomeCompleto: parsedData.data.nomeCompleto,
        usuario: parsedData.data.usuario,
        senha: parsedData.data.senha,
        dataNascimento: normalizeDateInput(parsedData.data.dataNascimento),
        turno: parsedData.data.turno,
        turma: parsedData.data.turma
      });
      navigate('/');
    } catch {
      setErrors({ form: 'Nao foi possivel cadastrar. Tente outro usuario.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="Crie seu acesso usando usuario e senha, sem e-mail." title="Crie sua conta.">
      <Card className="mx-auto w-full max-w-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Cadastro</h2>
              <p className="mt-2 text-sm text-slate-500">Etapa {step} de 4</p>
            </div>
            <Link className="text-sm font-semibold text-brand-blue hover:text-blue-700" to="/login">
              Entrar
            </Link>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <Input label="Nome Completo" name="nomeCompleto" error={errors.nomeCompleto} value={formData.nomeCompleto} onChange={(event) => updateField('nomeCompleto', event.target.value)} />
              <DatePicker
                error={errors.dataNascimento}
                label="Data de Nascimento"
                name="dataNascimento"
                onChange={(value) => updateField('dataNascimento', value)}
                value={formData.dataNascimento}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[Turno.MATUTINO, Turno.VESPERTINO].map((turno) => (
                <button
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${formData.turno === turno ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 bg-white text-brand-navy hover:bg-slate-50'}`}
                  key={turno}
                  onClick={() => {
                    updateField('turno', turno);
                    updateField('turma', turmasPorTurno[turno][0]);
                  }}
                  type="button"
                >
                  {turno}
                </button>
              ))}
              {errors.turno ? <p className="text-sm text-red-600 sm:col-span-2">{errors.turno}</p> : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {availableTurmas.map((turma) => (
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${formData.turma === turma ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 bg-white text-brand-navy hover:bg-slate-50'}`}
                  key={turma}
                  onClick={() => updateField('turma', turma)}
                  type="button"
                >
                  {turma}
                </button>
              ))}
              {errors.turma ? <p className="col-span-2 text-sm text-red-600 sm:col-span-4">{errors.turma}</p> : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <Input label="Usuario" name="usuario" error={errors.usuario} placeholder="seu.usuario" value={formData.usuario} onChange={(event) => updateField('usuario', event.target.value)} />
              <PasswordInput label="Senha" name="senha" error={errors.senha} value={formData.senha} onChange={(event) => updateField('senha', event.target.value)} />
              <PasswordInput label="Confirmar Senha" name="confirmarSenha" error={errors.confirmarSenha} value={formData.confirmarSenha} onChange={(event) => updateField('confirmarSenha', event.target.value)} />
            </div>
          ) : null}

          {errors.form ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</p> : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button disabled={step === 1 || isSubmitting} onClick={() => setStep((current) => Math.max(current - 1, 1))} type="button" variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext} type="button">
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={isSubmitting} type="submit">
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
