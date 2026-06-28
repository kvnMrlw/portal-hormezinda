import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { ProfileView } from '../components/profile/ProfileView';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';
import { getPublicProfile, type PublicProfileResponse } from '../services/users';
import { listUserIdeas } from '../services/ideas';
import type { Idea } from '../types/ideas';

export function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
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
        const [loadedProfile, loadedIdeas] = await Promise.all([getPublicProfile(id), listUserIdeas(id)]);
        setProfile(loadedProfile);
        setIdeas(loadedIdeas);
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
      {!isLoading && profile ? (
        <ProfileView
          editable={currentUser?.id === profile.usuario.id}
          estatisticas={profile.estatisticas}
          publicacoes={profile.publicacoes}
          professorResumo={profile.professorResumo}
          recentIdeas={ideas}
          stories={profile.stories}
          user={profile.usuario}
        />
      ) : null}
      {!isLoading && hasError ? (
        <EmptyState description="Nao foi possivel carregar este perfil." title="Perfil indisponivel." />
      ) : null}
    </AppShell>
  );
}
