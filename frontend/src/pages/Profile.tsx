import { CalendarDays, Link as LinkIcon, MapPin } from 'lucide-react';

import { AppShell } from '../components/app/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/useAuth';

export function Profile() {
  const { user } = useAuth();

  return (
    <AppShell>
      <Card className="overflow-hidden p-0">
        <div className="h-36 bg-gradient-to-r from-blue-100 via-white to-blue-200" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-28 w-28 border-4 border-white text-3xl" name={user?.nomeCompleto} src={user?.fotoPerfil} />
              <div className="pb-2">
                <h1 className="text-3xl font-semibold text-brand-navy">{user?.nomeCompleto}</h1>
                <p className="mt-1 text-slate-500">@{user?.usuario}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">Sobre</h2>
                <p className="mt-3 rounded-3xl bg-slate-50 p-5 leading-7 text-slate-600">
                  {user?.bio || 'Bio ainda nao preenchida.'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard icon={MapPin} label="Turma" value={`${user?.turma} - ${user?.turno}`} />
                <InfoCard icon={LinkIcon} label="Rede social" value={user?.redeSocial || 'Nao informada'} />
              </div>
            </section>

            <aside className="space-y-4">
              <Badge variant="info">{user?.cargo}</Badge>
              <InfoCard icon={CalendarDays} label="Data de ingresso" value="Em breve" />
            </aside>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

type InfoCardProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <Icon className="h-5 w-5 text-brand-blue" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-brand-navy">{value}</p>
    </div>
  );
}
