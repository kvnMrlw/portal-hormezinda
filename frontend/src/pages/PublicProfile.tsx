import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { ProfileView } from '../components/profile/ProfileView';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { getUserById } from '../services/users';
import type { User } from '../types/auth';

export function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        setUser(await getUserById(id));
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  return (
    <AppShell>
      {isLoading ? <Loading className="min-h-64" /> : null}
      {!isLoading && user ? <ProfileView user={user} /> : null}
      {!isLoading && hasError ? (
        <EmptyState description="Nao foi possivel carregar este perfil." title="Perfil indisponivel." />
      ) : null}
    </AppShell>
  );
}
