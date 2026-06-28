import {
  CalendarDays,
  Camera,
  ExternalLink,
  GraduationCap,
  ImagePlus,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { getAssetUrl } from '../../lib/assets';
import { calculateAge, getProfileDetails, getProfileHeadline } from '../../lib/profile';
import { getRoleLabel, isAdminRole } from '../../lib/roles';
import type { ProfileUpdatePayload, User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Textarea } from '../ui/Textarea';

type ProfileViewProps = {
  user: User;
  editable?: boolean;
};

type ProfileFormData = {
  bannerPerfil?: File;
  bio: string;
  confirmarSenha: string;
  fotoPerfil?: File;
  novaSenha: string;
  redeSocial: string;
  senhaAtual: string;
};

const maxImageSize = 5 * 1024 * 1024;

export function ProfileView({ editable = false, user }: ProfileViewProps) {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: user.bio ?? '',
    redeSocial: user.redeSocial ?? '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [bannerPreview, setBannerPreview] = useState<string>();
  const details = useMemo(() => getProfileDetails(user), [user]);
  const age = calculateAge(user.dataNascimento);
  const admin = isAdminRole(user.cargo);
  const avatarUrl = avatarPreview ?? getAssetUrl(user.fotoPerfil);
  const bannerUrl = bannerPreview ?? getAssetUrl(user.bannerPerfil);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      bio: user.bio ?? '',
      redeSocial: user.redeSocial ?? ''
    }));
  }, [user.bio, user.redeSocial]);

  useEffect(() => {
    if (!formData.fotoPerfil) {
      setAvatarPreview(undefined);
      return;
    }

    const previewUrl = URL.createObjectURL(formData.fotoPerfil);
    setAvatarPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [formData.fotoPerfil]);

  useEffect(() => {
    if (!formData.bannerPerfil) {
      setBannerPreview(undefined);
      return;
    }

    const previewUrl = URL.createObjectURL(formData.bannerPerfil);
    setBannerPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [formData.bannerPerfil]);

  function handleImageChange(field: 'bannerPerfil' | 'fotoPerfil', event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Selecione uma imagem valida.');
      return;
    }

    if (file.size > maxImageSize) {
      setMessage('A imagem deve ter no maximo 5MB.');
      return;
    }

    setMessage('');
    setFormData((current) => ({ ...current, [field]: file }));
  }

  function resetEditState(): void {
    setFormData({
      bio: user.bio ?? '',
      redeSocial: user.redeSocial ?? '',
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
    setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    const wantsPasswordChange = Boolean(formData.senhaAtual || formData.novaSenha || formData.confirmarSenha);

    if (wantsPasswordChange && (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha)) {
      setIsSaving(false);
      setMessage('Preencha todos os campos de senha.');
      return;
    }

    if (wantsPasswordChange && formData.novaSenha !== formData.confirmarSenha) {
      setIsSaving(false);
      setMessage('As senhas nao conferem.');
      return;
    }

    const payload: ProfileUpdatePayload = {
      bio: formData.bio,
      redeSocial: formData.redeSocial,
      ...(formData.fotoPerfil ? { fotoPerfil: formData.fotoPerfil } : {}),
      ...(formData.bannerPerfil ? { bannerPerfil: formData.bannerPerfil } : {}),
      ...(wantsPasswordChange
        ? {
            senhaAtual: formData.senhaAtual,
            novaSenha: formData.novaSenha,
            confirmarSenha: formData.confirmarSenha
          }
        : {})
    };

    try {
      await updateProfile(payload);
      setFormData((current) => ({
        ...current,
        bannerPerfil: undefined,
        fotoPerfil: undefined,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      }));
      setMessage('Perfil atualizado.');
      setIsEditing(false);
    } catch {
      setMessage('Nao foi possivel atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Card className="overflow-hidden p-0 shadow-sm">
        <div
          className="h-44 bg-gradient-to-br from-blue-100 via-white to-emerald-100 sm:h-56"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-32 w-32 border-4 border-white text-4xl shadow-soft" name={user.nomeCompleto} src={avatarUrl} />
              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">{user.nomeCompleto}</h1>
                  <Badge variant={admin ? 'success' : 'info'}>{getRoleLabel(user.cargo)}</Badge>
                </div>
                <p className="mt-1 text-slate-500">@{user.usuario}</p>
                <p className="mt-2 font-semibold text-brand-navy">{getProfileHeadline(user)}</p>
              </div>
            </div>
            {editable ? (
              <Button
                onClick={() => {
                  if (isEditing) {
                    resetEditState();
                  }

                  setIsEditing((current) => !current);
                }}
                type="button"
                variant="secondary"
              >
                <Pencil className="h-4 w-4" />
                Editar Perfil
              </Button>
            ) : null}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">Sobre</h2>
                <p className="mt-3 rounded-3xl bg-slate-50 p-5 leading-7 text-slate-600">
                  {admin ? 'Administrador do Sistema' : user.bio || 'Bio ainda nao preenchida.'}
                </p>
              </div>

              {isEditing ? (
                <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5" onSubmit={handleSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/50">
                      <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-brand-blue" />
                        Alterar foto
                      </span>
                      <input accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => handleImageChange('fotoPerfil', event)} type="file" />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/50">
                      <span className="flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-brand-blue" />
                        Alterar banner
                      </span>
                      <input accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => handleImageChange('bannerPerfil', event)} type="file" />
                    </label>
                  </div>
                  <Textarea label="Bio" maxLength={280} name="bio" onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))} value={formData.bio ?? ''} />
                  <Input label="Rede social" name="redeSocial" onChange={(event) => setFormData((current) => ({ ...current, redeSocial: event.target.value }))} placeholder="@usuario ou link" value={formData.redeSocial ?? ''} />
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-navy">
                      <KeyRound className="h-4 w-4 text-brand-blue" />
                      Alteracao de senha
                    </div>
                    <div className="grid gap-3">
                      <PasswordInput autoComplete="current-password" label="Senha atual" name="senhaAtual" onChange={(event) => setFormData((current) => ({ ...current, senhaAtual: event.target.value }))} value={formData.senhaAtual} />
                      <PasswordInput autoComplete="new-password" label="Nova senha" name="novaSenha" onChange={(event) => setFormData((current) => ({ ...current, novaSenha: event.target.value }))} value={formData.novaSenha} />
                      <PasswordInput autoComplete="new-password" label="Confirmar senha" name="confirmarSenha" onChange={(event) => setFormData((current) => ({ ...current, confirmarSenha: event.target.value }))} value={formData.confirmarSenha} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      onClick={() => {
                        resetEditState();
                        setIsEditing(false);
                      }}
                      type="button"
                      variant="secondary"
                    >
                      Cancelar
                    </Button>
                    <Button disabled={isSaving} type="submit">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                  {message ? <p className="text-sm text-slate-500">{message}</p> : null}
                </form>
              ) : null}

              {user.redeSocial ? (
                <a
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-brand-blue transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  href={user.redeSocial.startsWith('http') ? user.redeSocial : undefined}
                  rel="noreferrer"
                  target={user.redeSocial.startsWith('http') ? '_blank' : undefined}
                >
                  <ExternalLink className="h-4 w-4" />
                  {user.redeSocial}
                </a>
              ) : null}
            </section>

            <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoCard icon={ShieldCheck} label="Cargo" value={getRoleLabel(user.cargo)} />
              {age && !admin ? <InfoCard icon={CalendarDays} label="Idade" value={age} /> : null}
              {details[0] ? <InfoCard icon={GraduationCap} label="Turma" value={details[0]} /> : null}
              {details[1] ? <InfoCard icon={MapPin} label="Turno" value={details[1]} /> : null}
              {!admin && !details.length ? <InfoCard icon={LinkIcon} label="Perfil" value="Informacoes em breve" /> : null}
            </aside>
          </div>
        </div>
      </Card>
    </div>
  );
}

type InfoCardProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-brand-blue" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-brand-navy">{value}</p>
    </div>
  );
}
