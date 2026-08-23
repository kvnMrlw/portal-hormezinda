import {
  CalendarDays,
  Bell,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Grid3X3,
  Heart,
  KeyRound,
  Lightbulb,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../contexts/useAuth';
import { getAssetUrl } from '../../lib/assets';
import { calculateAge, getProfileDetails, getProfileHeadline } from '../../lib/profile';
import { getDisplayRoleLabel, isAdminRole } from '../../lib/roles';
import type { ProfileUpdatePayload, User } from '../../types/auth';
import { Cargo } from '../../types/auth';
import type { AcademicSummary } from '../../types/academic';
import { StoryKind, type FeedPost, type FeedStory } from '../../types/feed';
import type { Idea } from '../../types/ideas';
import { ideaCategoryLabels, ideaStatusLabels } from '../../types/ideas';
import type { Notification } from '../../types/notifications';
import { weekdayLabels, type Weekday } from '../../types/schedules';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { RoleBadge } from '../ui/RoleBadge';
import { Textarea } from '../ui/Textarea';

type ProfileViewProps = {
  user: User;
  editable?: boolean;
  estatisticas?: {
    curtidasRecebidas: number;
    apoiosRecebidos?: number;
    ideiasCriadas?: number;
    publicacoes: number;
    stories?: number;
  };
  publicacoes?: FeedPost[];
  recentIdeas?: Idea[];
  recentNotifications?: Notification[];
  academicSummary?: AcademicSummary;
  professorResumo?: {
    cargaHorariaMinutos: number;
    disciplinas: string[];
    horarioSemanal: Array<{
      diaSemana: string;
      disciplina: string;
      horarioFim: string;
      horarioInicio: string;
      sala: string;
      turma: string;
    }>;
    proximaAula?: {
      diaSemana: string;
      disciplina: string;
      horarioInicio: string;
      sala: string;
    };
    quantidadeTurmas: number;
  };
  stories?: FeedStory[];
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

export function ProfileView({
  academicSummary,
  editable = false,
  estatisticas,
  professorResumo,
  publicacoes,
  recentIdeas,
  recentNotifications,
  stories,
  user,
}: ProfileViewProps) {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: user.bio ?? '',
    redeSocial: user.redeSocial ?? '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
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
      redeSocial: user.redeSocial ?? '',
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

  function handleImageChange(
    field: 'bannerPerfil' | 'fotoPerfil',
    event: ChangeEvent<HTMLInputElement>,
  ): void {
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
      confirmarSenha: '',
    });
    setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    const wantsPasswordChange = Boolean(
      formData.senhaAtual || formData.novaSenha || formData.confirmarSenha,
    );

    if (
      wantsPasswordChange &&
      (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha)
    ) {
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
            confirmarSenha: formData.confirmarSenha,
          }
        : {}),
    };

    try {
      await updateProfile(payload);
      setFormData((current) => ({
        ...current,
        bannerPerfil: undefined,
        fotoPerfil: undefined,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
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
    <div className="profile-social-page">
      <Card className="profile-social-card">
        <div className="profile-social-cover">
          {!bannerUrl ? <div className="profile-cover-art" aria-hidden="true" /> : null}
          {bannerUrl ? <img alt="" className="profile-cover-image" src={bannerUrl} /> : null}
          <div className="profile-cover-shade" />
          {editable && isEditing ? (
            <label className="profile-cover-edit-control" title="Alterar banner">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Alterar banner</span>
              <input
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => handleImageChange('bannerPerfil', event)}
                type="file"
              />
            </label>
          ) : null}
        </div>

        <div className="profile-social-body">
          <div className="profile-social-header">
            <div className={`profile-avatar-wrap ${isEditing ? 'is-editing' : ''}`}>
              <Avatar
                className="profile-social-avatar"
                name={user.nomeCompleto}
                src={avatarUrl}
              />
              <span className="profile-status-dot" aria-label="Perfil ativo" />
              {editable && isEditing ? (
                <label className="profile-avatar-edit-control" title="Alterar foto de perfil">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Alterar foto de perfil</span>
                  <input
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => handleImageChange('fotoPerfil', event)}
                    type="file"
                  />
                </label>
              ) : null}
            </div>

            <div className="profile-social-identity">
              <div className="profile-name-line">
                <h1>{user.nomeCompleto}</h1>
                <RoleBadge user={user} />
              </div>
              <p className="profile-handle">@{user.usuario}</p>
              <p className="profile-headline">{getProfileHeadline(user)}</p>
            </div>

            {editable ? (
              <Button
                className="profile-edit-button"
                onClick={() => {
                  if (isEditing) resetEditState();
                  setIsEditing((current) => !current);
                }}
                type="button"
                variant="secondary"
              >
                <Pencil className="h-4 w-4" />
                Editar perfil
              </Button>
            ) : null}
          </div>

          {estatisticas ? (
            <div className="profile-stats-wrap">
              <SocialStatsCards estatisticas={estatisticas} storiesCount={stories?.length ?? 0} />
            </div>
          ) : null}

          <div className="profile-social-grid">
            <section className="profile-social-main">
              <div className="profile-bio-card">
                <span>Sobre</span>
                <p>{admin ? 'Administrador do Sistema' : user.bio || 'Bio ainda não preenchida.'}</p>
                {user.redeSocial ? (
                  <a
                    href={user.redeSocial.startsWith('http') ? user.redeSocial : undefined}
                    rel="noreferrer"
                    target={user.redeSocial.startsWith('http') ? '_blank' : undefined}
                  >
                    <ExternalLink /> {user.redeSocial}
                  </a>
                ) : null}
              </div>

              {stories ? <StoryStrip stories={stories} /> : null}
              {professorResumo ? <TeacherProfileSummary professorResumo={professorResumo} /> : null}
              {academicSummary ? <AcademicProfileSummary academicSummary={academicSummary} user={user} /> : null}

              {isEditing ? (
                <form className="profile-edit-panel" onSubmit={handleSubmit}>
                  <Textarea label="Bio" maxLength={280} name="bio" onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))} value={formData.bio ?? ''} />
                  <Input label="Rede social" name="redeSocial" onChange={(event) => setFormData((current) => ({ ...current, redeSocial: event.target.value }))} placeholder="@usuario ou link" value={formData.redeSocial ?? ''} />
                  <div className="profile-password-block">
                    <div className="profile-password-title"><KeyRound /> Alteração de senha</div>
                    <div className="grid gap-3">
                      <PasswordInput autoComplete="current-password" label="Senha atual" name="senhaAtual" onChange={(event) => setFormData((current) => ({ ...current, senhaAtual: event.target.value }))} value={formData.senhaAtual} />
                      <PasswordInput autoComplete="new-password" label="Nova senha" name="novaSenha" onChange={(event) => setFormData((current) => ({ ...current, novaSenha: event.target.value }))} value={formData.novaSenha} />
                      <PasswordInput autoComplete="new-password" label="Confirmar senha" name="confirmarSenha" onChange={(event) => setFormData((current) => ({ ...current, confirmarSenha: event.target.value }))} value={formData.confirmarSenha} />
                    </div>
                  </div>
                  <div className="profile-edit-actions">
                    <Button onClick={() => { resetEditState(); setIsEditing(false); }} type="button" variant="secondary">Cancelar</Button>
                    <Button disabled={isSaving} type="submit">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? 'Salvando...' : 'Salvar alterações'}</Button>
                  </div>
                  {message ? <p className="text-sm text-slate-500">{message}</p> : null}
                </form>
              ) : null}
            </section>

            <aside className="profile-social-aside">
              <div className="profile-details-card">
                <span className="profile-details-kicker">Informações</span>
                <InfoCard icon={ShieldCheck} label="Cargo" value={getDisplayRoleLabel(user)} />
                {age && !admin ? <InfoCard icon={CalendarDays} label="Idade" value={age} /> : null}
                {user.cargo === Cargo.PROFESSOR && user.materia ? <InfoCard icon={BookOpen} label="Matéria" value={user.materia} /> : null}
                {(user.cargo === Cargo.ALUNO || user.cargo === Cargo.GREMIO) && details[0] ? <InfoCard icon={BookOpen} label="Turma" value={details[0]} /> : null}
                {details[1] ? <InfoCard icon={MapPin} label="Turno" value={details[1]} /> : null}
                {user.telefone ? <InfoCard icon={LinkIcon} label="Telefone" value={user.telefone} /> : null}
                <InfoCard icon={CalendarDays} label="Entrada" value={new Intl.DateTimeFormat('pt-BR').format(new Date(user.criadoEm))} />
              </div>
            </aside>
          </div>
        </div>
      </Card>

      <div className="profile-secondary-grid">
        {recentNotifications ? <NotificationPreview notifications={recentNotifications} /> : null}
        {recentIdeas ? <IdeaPreview ideas={recentIdeas} /> : null}
      </div>
      {publicacoes ? <PostGrid posts={publicacoes} /> : null}
    </div>
  );
}

function TeacherProfileSummary({
  professorResumo,
}: {
  professorResumo: NonNullable<ProfileViewProps['professorResumo']>;
}) {
  const hours = Math.floor(professorResumo.cargaHorariaMinutos / 60);
  const minutes = professorResumo.cargaHorariaMinutos % 60;

  return (
    <section className="rounded-3xl border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80">
      <h2 className="text-lg font-semibold text-brand-navy">Agenda docente</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoPill
          label="Disciplinas"
          value={
            professorResumo.disciplinas.length ? professorResumo.disciplinas.join(', ') : 'Nenhuma'
          }
        />
        <InfoPill label="Turmas" value={String(professorResumo.quantidadeTurmas)} />
        <InfoPill label="Carga horaria" value={`${hours}h${minutes ? ` ${minutes}min` : ''}`} />
      </div>
      {professorResumo.proximaAula ? (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-brand-blue ring-1 ring-blue-100">
          Proxima aula: {weekdayLabels[professorResumo.proximaAula.diaSemana as Weekday]} -{' '}
          {professorResumo.proximaAula.horarioInicio} - {professorResumo.proximaAula.disciplina} -{' '}
          {professorResumo.proximaAula.sala}
        </div>
      ) : null}
      {professorResumo.horarioSemanal.length ? (
        <div className="mt-4 divide-y divide-slate-100">
          {professorResumo.horarioSemanal.map((lesson) => (
            <div
              className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_1fr_7rem]"
              key={`${lesson.diaSemana}-${lesson.horarioInicio}-${lesson.turma}`}
            >
              <span className="font-bold text-brand-navy">
                {lesson.horarioInicio} - {lesson.horarioFim}
              </span>
              <span className="font-semibold text-slate-600">
                {lesson.disciplina} - {lesson.turma}
              </span>
              <span className="font-semibold text-slate-500 sm:text-right">{lesson.sala}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SocialStatsCards({
  estatisticas,
  storiesCount,
}: {
  estatisticas: NonNullable<ProfileViewProps['estatisticas']>;
  storiesCount: number;
}) {
  const stats = [
    { label: 'Publicações', value: estatisticas.publicacoes },
    { label: 'Stories', value: estatisticas.stories ?? storiesCount },
    { label: 'Ideias', value: estatisticas.ideiasCriadas ?? 0 },
    { label: 'Curtidas', value: estatisticas.curtidasRecebidas },
    { label: 'Apoios', value: estatisticas.apoiosRecebidos ?? 0 },
  ];

  return (
    <section className="grid grid-cols-3 overflow-hidden rounded-[1.7rem] border border-slate-950/5 bg-white/86 shadow-card ring-1 ring-white/80 sm:grid-cols-5">
      {stats.map((stat) => (
        <div className="relative px-2 py-4 text-center sm:px-4" key={stat.label}>
          <span className="absolute bottom-3 right-0 top-3 hidden w-px bg-slate-100 sm:block last:hidden" />
          <p className="text-xl font-extrabold tracking-[-0.03em] text-brand-navy sm:text-2xl">{stat.value}</p>
          <p className="mt-1 text-[0.66rem] font-bold text-slate-400 sm:text-xs">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

function AcademicProfileSummary({
  academicSummary,
  user,
}: {
  academicSummary: AcademicSummary;
  user: User;
}) {
  const isStudent = user.cargo === Cargo.ALUNO || user.cargo === Cargo.GREMIO;

  return (
    <section className="rounded-3xl border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80">
      <h2 className="text-lg font-semibold text-brand-navy">
        {isStudent ? 'Resumo academico' : 'Atividades academicas'}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoPill
          label="Disciplinas"
          value={
            academicSummary.disciplinas.length ? academicSummary.disciplinas.join(', ') : 'Nenhuma'
          }
        />
        <InfoPill label="Turmas" value={String(academicSummary.quantidadeTurmas)} />
        <InfoPill
          label="Tarefas recentes"
          value={String(academicSummary.ultimasAtividades.length)}
        />
      </div>
      {academicSummary.proximaAula ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          Proxima aula: {weekdayLabels[academicSummary.proximaAula.diaSemana]} -{' '}
          {academicSummary.proximaAula.horarioInicio} - {academicSummary.proximaAula.disciplina}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Ultimas tarefas
          </p>
          {academicSummary.ultimasAtividades.slice(0, 3).map((task) => (
            <p className="mt-2 text-sm font-semibold text-brand-navy" key={task.id}>
              {task.titulo}
            </p>
          ))}
          {!academicSummary.ultimasAtividades.length ? (
            <p className="mt-2 text-sm text-slate-500">Nenhuma tarefa recente.</p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Ultimos conteudos
          </p>
          {academicSummary.ultimosConteudos.slice(0, 3).map((content) => (
            <p className="mt-2 text-sm font-semibold text-brand-navy" key={content.id}>
              {content.titulo}
            </p>
          ))}
          {!academicSummary.ultimosConteudos.length ? (
            <p className="mt-2 text-sm text-slate-500">Nenhum conteudo recente.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 shadow-inner ring-1 ring-slate-950/5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p>
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
    <div className="rounded-3xl border border-slate-950/5 bg-white p-5 shadow-card ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-hover">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

function StoryStrip({ stories }: { stories: FeedStory[] }) {
  return (
    <section className="profile-story-section">
      <div className="profile-story-section-head">
        <h2>Stories publicos</h2>
        {stories.length ? <span>{stories.length} ativo{stories.length === 1 ? '' : 's'}</span> : null}
      </div>
      {stories.length ? (
        <div className="profile-story-strip" aria-label="Stories publicos">
          {stories.map((story) => (
            <article className="profile-story-item" key={story.id}>
              <div
                  className={`profile-story-circle-ring ${
                    story.vistoPeloUsuario ? 'is-viewed' : 'is-unseen'
                  }`}
                >
                <div
                  className="profile-story-circle"
                  style={story.tipo === StoryKind.TEXT ? { backgroundColor: story.fundo } : undefined}
                >
                  {story.imagem ? (
                    <img
                      alt={story.texto || 'Story'}
                      decoding="async"
                      loading="lazy"
                      src={getAssetUrl(story.imagem.url)}
                    />
                  ) : (
                    <p>{story.texto || 'Story'}</p>
                  )}
                </div>
              </div>
              <span>Story</span>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-3xl bg-slate-50/90 p-5 text-sm text-slate-500 ring-1 ring-slate-100">
          Nenhum story publico no momento.
        </p>
      )}
    </section>
  );
}

function PostGrid({ posts }: { posts: FeedPost[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-5 w-5 text-brand-blue" />
        <h2 className="text-lg font-semibold text-brand-navy">Publicacoes</h2>
      </div>
      {posts.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const image = post.imagens[0];

            return (
              <article
                className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-950/5 transition hover:-translate-y-1 hover:shadow-hover"
                key={post.id}
              >
                {image ? (
                  <img
                    alt={image.alt || post.texto || 'Publicacao'}
                    className="aspect-square w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src={getAssetUrl(image.url)}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center p-5 text-center text-sm font-semibold leading-6 text-brand-navy">
                    {post.texto || 'Publicacao'}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-slate-500">
                  <span>{new Intl.DateTimeFormat('pt-BR').format(new Date(post.data))}</span>
                  <span>
                    {post.reacoes.reduce((total, reaction) => total + reaction.quantidade, 0)}{' '}
                    curtidas
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
          Nenhuma publicacao encontrada.
        </p>
      )}
    </Card>
  );
}

function NotificationPreview({ notifications }: { notifications: Notification[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-brand-blue" />
        <h2 className="text-lg font-semibold text-brand-navy">Ultimas notificacoes</h2>
      </div>
      {notifications.length ? (
        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <article
              className="rounded-2xl bg-slate-50 p-4 shadow-inner ring-1 ring-slate-950/5 transition hover:bg-white hover:shadow-card"
              key={notification.id}
            >
              <div className="flex items-start gap-2">
                {!notification.lida ? (
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-blue" />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-navy">
                    {notification.titulo}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {notification.descricao}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
          Nenhuma notificacao recente.
        </p>
      )}
    </Card>
  );
}

function IdeaPreview({ ideas }: { ideas: Idea[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <h2 className="text-lg font-semibold text-brand-navy">Ultimas ideias</h2>
      </div>
      {ideas.length ? (
        <div className="mt-4 space-y-3">
          {ideas.map((idea) => (
            <article
              className="rounded-2xl bg-slate-50 p-4 shadow-inner ring-1 ring-slate-950/5 transition hover:bg-white hover:shadow-card"
              key={idea.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-navy">{idea.titulo}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {ideaCategoryLabels[idea.categoria]} - {ideaStatusLabels[idea.status]}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue">
                  {idea.quantidadeApoios}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
          Nenhuma ideia criada ainda.
        </p>
      )}
    </Card>
  );
}
