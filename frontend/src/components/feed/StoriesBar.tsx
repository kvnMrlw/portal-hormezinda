import { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { Avatar } from '../ui/Avatar';
import { getAssetUrl, type StoryGroup } from './feedUtils';

type StoriesBarProps = {
  groups: StoryGroup[];
  isLoading: boolean;
  onOpen: (groupIndex: number) => void;
  canCreate?: boolean;
  onCreate?: () => void;
  currentUserName?: string;
  currentUserAvatar?: string;
};

export const StoriesBar = memo(function StoriesBar({
  groups,
  isLoading,
  onOpen,
  canCreate = false,
  onCreate,
  currentUserName,
  currentUserAvatar,
}: StoriesBarProps) {
  return (
    <section className="portal-stories-shell" aria-label="Stories da comunidade">
      <div className="portal-stories-heading">
        <div>
          <span>Comunidade</span>
          <h2>Stories</h2>
        </div>
        <p>Momentos rápidos da escola</p>
      </div>

      <div className="portal-stories-scroll">
        {canCreate ? (
          <motion.button
            className="portal-story portal-story-create"
            onClick={onCreate}
            type="button"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="portal-story-ring portal-story-ring-unseen portal-story-create-ring">
              <span className="portal-story-avatar">
                <Avatar
                  className="h-full w-full"
                  name={currentUserName ?? 'Você'}
                  src={getAssetUrl(currentUserAvatar)}
                />
              </span>
              <span className="portal-story-plus"><Plus /></span>
            </span>
            <strong>Seu story</strong>
          </motion.button>
        ) : null}

        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div className="portal-story" key={index}>
                <span className="portal-story-skeleton" />
                <span className="portal-story-label-skeleton" />
              </div>
            ))
          : null}

        {!isLoading && groups.length === 0 && !canCreate ? (
          <div className="portal-stories-empty">Nenhum story ativo agora.</div>
        ) : null}

        {!isLoading
          ? groups.map((group, index) => (
              <motion.button
                className="portal-story"
                key={group.authorId}
                onClick={() => onOpen(index)}
                type="button"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className={group.hasUnseen ? 'portal-story-ring portal-story-ring-unseen' : 'portal-story-ring'}>
                  <span className="portal-story-avatar">
                    <Avatar
                      className="h-full w-full"
                      name={group.authorName}
                      src={getAssetUrl(group.avatar)}
                    />
                  </span>
                  {group.hasUnseen ? <span className="portal-story-online" /> : null}
                </span>
                <strong>{group.authorName.split(' ')[0]}</strong>
              </motion.button>
            ))
          : null}
      </div>
    </section>
  );
});
