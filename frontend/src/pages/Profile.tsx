import { AppShell } from '../components/app/AppShell';
import { ProfileView } from '../components/profile/ProfileView';
import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';

export function Profile() {
  const { user } = useAuth();

  return (
    <AppShell>
      {user ? <ProfileView editable user={user} /> : <Loading className="min-h-64" />}
    </AppShell>
  );
}
