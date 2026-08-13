import { Camera, ImagePlus, KeyRound, Settings as SettingsIcon, Shield, Bell } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/useAuth';
import type {
  NotificationPreferences,
  PrivacyPreferences,
  ProfileUpdatePayload,
} from '../types/auth';

type SettingsForm = {
  bio: string;
  telefone: string;
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
  fotoPerfil?: File;
  bannerPerfil?: File;
  privacidade: PrivacyPreferences;
  notificacoes: NotificationPreferences;
};

const privacyLabels: Record<keyof PrivacyPreferences, string> = {
  mostrarAniversario: 'Mostrar aniversario',
  mostrarBanner: 'Mostrar banner',
  mostrarBio: 'Mostrar bio',
  mostrarTelefone: 'Mostrar telefone',
};

const notificationLabels: Record<keyof NotificationPreferences, string> = {
  aniversarios: 'Aniversarios',
  avisos: 'Avisos',
  cursos: 'Cursos',
  ideias: 'Ideias',
  publicacoes: 'Publicacoes',
  stories: 'Stories',
};

export function Settings() {
  const { updateProfile, user } = useAuth();
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    setForm({
      bio: user.bio ?? '',
      telefone: user.telefone ?? '',
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
      privacidade: user.privacidade,
      notificacoes: user.notificacoes,
    });
  }, [user]);

  function handleFile(
    field: 'bannerPerfil' | 'fotoPerfil',
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0];
    if (!file || !form) return;

    setForm({ ...form, [field]: file });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!form) return;

    if (
      (form.senhaAtual || form.novaSenha || form.confirmarSenha) &&
      form.novaSenha !== form.confirmarSenha
    ) {
      setMessage('As senhas nao conferem.');
      return;
    }

    const payload: ProfileUpdatePayload = {
      bio: form.bio,
      telefone: form.telefone,
      privacidade: form.privacidade,
      notificacoes: form.notificacoes,
      ...(form.fotoPerfil ? { fotoPerfil: form.fotoPerfil } : {}),
      ...(form.bannerPerfil ? { bannerPerfil: form.bannerPerfil } : {}),
      ...(form.senhaAtual || form.novaSenha || form.confirmarSenha
        ? {
            senhaAtual: form.senhaAtual,
            novaSenha: form.novaSenha,
            confirmarSenha: form.confirmarSenha,
          }
        : {}),
    };

    try {
      setIsSaving(true);
      await updateProfile(payload);
      setMessage('Configuracoes atualizadas.');
      setForm((current) =>
        current
          ? {
              ...current,
              bannerPerfil: undefined,
              confirmarSenha: '',
              fotoPerfil: undefined,
              novaSenha: '',
              senhaAtual: '',
            }
          : current,
      );
    } catch {
      setMessage('Nao foi possivel atualizar as configuracoes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!form) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form className="mx-auto max-w-5xl space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <header className="rounded-3xl border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Conta</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
                Configuracoes
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Controle seus dados, privacidade e notificacoes.
              </p>
            </div>
          </div>
        </header>

        {message ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-brand-blue">
            {message}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Card className="p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-navy">Perfil</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:bg-blue-50">
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-brand-blue" />
                    Alterar foto
                  </span>
                  <input
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => handleFile('fotoPerfil', event)}
                    type="file"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:bg-blue-50">
                  <span className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-brand-blue" />
                    Alterar banner
                  </span>
                  <input
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => handleFile('bannerPerfil', event)}
                    type="file"
                  />
                </label>
              </div>
              <div className="mt-4 grid gap-4">
                <Textarea
                  label="Bio"
                  maxLength={280}
                  name="bio"
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  value={form.bio}
                />
                <Input
                  label="Telefone opcional"
                  name="telefone"
                  onChange={(event) => setForm({ ...form, telefone: event.target.value })}
                  value={form.telefone}
                />
              </div>
            </Card>

            <Card className="p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-navy">
                <KeyRound className="h-5 w-5 text-brand-blue" />
                Senha
              </h2>
              <div className="mt-4 grid gap-3">
                <PasswordInput
                  label="Senha atual"
                  name="senhaAtual"
                  onChange={(event) => setForm({ ...form, senhaAtual: event.target.value })}
                  value={form.senhaAtual}
                />
                <PasswordInput
                  label="Nova senha"
                  name="novaSenha"
                  onChange={(event) => setForm({ ...form, novaSenha: event.target.value })}
                  value={form.novaSenha}
                />
                <PasswordInput
                  label="Confirmar nova senha"
                  name="confirmarSenha"
                  onChange={(event) => setForm({ ...form, confirmarSenha: event.target.value })}
                  value={form.confirmarSenha}
                />
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <PreferenceCard
              icon={Shield}
              labels={privacyLabels}
              title="Privacidade"
              values={form.privacidade}
              onChange={(key, value) =>
                setForm({ ...form, privacidade: { ...form.privacidade, [key]: value } })
              }
            />
            <PreferenceCard
              icon={Bell}
              labels={notificationLabels}
              title="Notificacoes"
              values={form.notificacoes}
              onChange={(key, value) =>
                setForm({ ...form, notificacoes: { ...form.notificacoes, [key]: value } })
              }
            />
            <Button className="w-full" disabled={isSaving} type="submit">
              {isSaving ? 'Salvando...' : 'Salvar configuracoes'}
            </Button>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}

function PreferenceCard<T extends Record<string, boolean>>({
  icon: Icon,
  labels,
  onChange,
  title,
  values,
}: {
  icon: typeof Shield;
  labels: Record<keyof T, string>;
  onChange: (key: keyof T, value: boolean) => void;
  title: string;
  values: T;
}) {
  return (
    <Card className="p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-navy">
        <Icon className="h-5 w-5 text-brand-blue" />
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {(Object.keys(values) as Array<keyof T>).map((key) => (
          <label
            className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-100"
            key={String(key)}
          >
            {labels[key]}
            <input
              checked={values[key]}
              className="h-4 w-4 accent-brand-blue"
              onChange={(event) => onChange(key, event.target.checked)}
              type="checkbox"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
