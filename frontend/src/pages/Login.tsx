import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ZodError } from 'zod';

import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';

type LoginErrors = Partial<Record<keyof LoginFormData | 'form', string>>;

function zodErrorsToFormErrors(error: ZodError): LoginErrors {
  return error.issues.reduce<LoginErrors>((errors, issue) => {
    const field = issue.path[0] as keyof LoginFormData | undefined;

    if (field) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
}

// Pagina de login por usuario e senha.
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({ usuario: '', senha: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      navigate('/');
    } catch {
      setErrors({ form: 'Nao foi possivel entrar. Confira usuario e senha.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="Entre com o usuario criado no Portal Hormezinda." title="Bem-vindo de volta.">
      <Card className="mx-auto w-full max-w-md">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-semibold">Entrar</h2>
            <p className="mt-2 text-sm text-slate-500">Acesso com usuario e senha.</p>
          </div>

          <Input
            autoComplete="username"
            error={errors.usuario}
            label="Usuario"
            name="usuario"
            onChange={(event) => setFormData((current) => ({ ...current, usuario: event.target.value }))}
            placeholder="seu.usuario"
            value={formData.usuario}
          />

          <Input
            autoComplete="current-password"
            error={errors.senha}
            label="Senha"
            name="senha"
            onChange={(event) => setFormData((current) => ({ ...current, senha: event.target.value }))}
            placeholder="Sua senha"
            type="password"
            value={formData.senha}
          />

          {errors.form ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</p> : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? <LockKeyhole className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>

          <Link
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
            to="/cadastro"
          >
            <UserRound className="h-4 w-4" />
            Criar Conta
          </Link>
        </form>
      </Card>
    </AuthLayout>
  );
}
