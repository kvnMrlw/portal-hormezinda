import { useEffect, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { ProfileView } from '../components/profile/ProfileView';
import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';
import { listUserIdeas } from '../services/ideas';
import { listNotifications } from '../services/notifications';
import { getPublicProfile, type PublicProfileResponse } from '../services/users';
import type { Idea } from '../types/ideas';
import type { Notification } from '../types/notifications';

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function loadProfileExtras() {
      if (!user) return;

      const [loadedProfile, loadedIdeas, loadedNotifications] = await Promise.all([
        getPublicProfile(user.id, { postsLimit: 6 }),
        listUserIdeas(user.id),
        listNotifications({ limit: 5 })
      ]);

      setProfile(loadedProfile);
      setIdeas(loadedIdeas);
      setNotifications(loadedNotifications.notificacoes);
    }

    void loadProfileExtras().catch(() => undefined);
  }, [user]);

  return (
    <AppShell>
      {user ? (
        <ProfileView
          editable
          estatisticas={profile?.estatisticas}
          publicacoes={profile?.publicacoes}
          recentIdeas={ideas}
          recentNotifications={notifications}
          stories={profile?.stories}
          user={user}
        />
      ) : <Loading className="min-h-64" />}
    </AppShell>
  );
}
