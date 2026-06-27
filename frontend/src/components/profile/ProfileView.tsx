import { CalendarDays, ExternalLink, GraduationCap, Link as LinkIcon, MapPin, Pencil, ShieldCheck } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { calculateAge, getProfileDetails, getProfileHeadline } from '../../lib/profile';
import { getRoleLabel, isAdminRole } from '../../lib/roles';
import type { ProfileUpdatePayload, User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

type ProfileViewProps = {
  user: User;
  editable?: boolean;
};

export function ProfileView({ editable = false, user }: ProfileViewProps) {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<ProfileUpdatePayload>({
    bannerPerfil: user.bannerPerfil,
    fotoPerfil: user.fotoPerfil,
    bio: user.bio,
    redeSocial: user.redeSocial
  });
  const details = useMemo(() => getProfileDetails(user), [user]);
  const age = calculateAge(user.dataNascimento);
  const admin = isAdminRole(user.cargo);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateProfile(formData);
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
          style={user.bannerPerfil ? { backgroundImage: `url(${user.bannerPerfil})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-32 w-32 border-4 border-white text-4xl shadow-soft" name={user.nomeCompleto} src={user.fotoPerfil} />
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
              <Button onClick={() => setIsEditing((current) => !current)} type="button" variant="secondary">
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
                  <Input label="Banner" name="bannerPerfil" onChange={(event) => setFormData((current) => ({ ...current, bannerPerfil: event.target.value }))} placeholder="URL da imagem do banner" value={formData.bannerPerfil ?? ''} />
                  <Input label="Avatar" name="fotoPerfil" onChange={(event) => setFormData((current) => ({ ...current, fotoPerfil: event.target.value }))} placeholder="URL da imagem do avatar" value={formData.fotoPerfil ?? ''} />
                  <Textarea label="Bio" maxLength={280} name="bio" onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))} value={formData.bio ?? ''} />
                  <Input label="Rede social" name="redeSocial" onChange={(event) => setFormData((current) => ({ ...current, redeSocial: event.target.value }))} placeholder="@usuario ou link" value={formData.redeSocial ?? ''} />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button onClick={() => setIsEditing(false)} type="button" variant="secondary">
                      Cancelar
                    </Button>
                    <Button disabled={isSaving} type="submit">
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
