import { Loader2, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StoryKind, type FeedStory } from '../../types/feed';
import { getAssetUrl, type StoryGroup } from './feedUtils';

type StoryViewerProps = {
  groups: StoryGroup[];
  initialGroupIndex: number;
  canDeleteStory?: (story: FeedStory) => boolean;
  deletingStoryId?: string;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
  onView: (storyId: string) => void;
};

export function StoryViewer({
  canDeleteStory,
  deletingStoryId,
  groups,
  initialGroupIndex,
  onClose,
  onDelete,
  onView
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const viewedStoriesRef = useRef(new Set<string>());
  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const storyId = story?.id;
  const storyViewed = story?.vistoPeloUsuario;

  const totalStories = useMemo(() => group?.stories.length ?? 0, [group]);

  const goNext = useCallback(() => {
    setProgress(0);

    if (storyIndex + 1 < totalStories) {
      setStoryIndex((current) => current + 1);
      return;
    }

    if (groupIndex + 1 < groups.length) {
      setGroupIndex((current) => current + 1);
      setStoryIndex(0);
      return;
    }

    onClose();
  }, [groupIndex, groups.length, onClose, storyIndex, totalStories]);

  const goPrevious = useCallback(() => {
    setProgress(0);

    if (storyIndex > 0) {
      setStoryIndex((current) => current - 1);
      return;
    }

    if (groupIndex > 0) {
      const previousGroup = groups[groupIndex - 1];
      setGroupIndex((current) => current - 1);
      setStoryIndex(Math.max(previousGroup.stories.length - 1, 0));
    }
  }, [groupIndex, groups, storyIndex]);

  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(0);
    setProgress(0);
  }, [initialGroupIndex]);

  useEffect(() => {
    if (storyId && !storyViewed && !viewedStoriesRef.current.has(storyId)) {
      viewedStoriesRef.current.add(storyId);
      onView(storyId);
    }
  }, [onView, storyId, storyViewed]);

  useEffect(() => {
    if (groups.length === 0 || groupIndex >= groups.length) {
      onClose();
    }
  }, [groupIndex, groups.length, onClose]);

  useEffect(() => {
    if (group && storyIndex >= group.stories.length) {
      setStoryIndex(Math.max(group.stories.length - 1, 0));
      setProgress(0);
    }
  }, [group, storyIndex]);

  useEffect(() => {
    if (!storyId) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          goNext();
          return 0;
        }

        return current + 2;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [goNext, storyId]);

  if (!story || !group) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950 px-0 py-0 sm:px-6 sm:py-6">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-full w-full overflow-hidden bg-slate-900 shadow-2xl sm:h-[min(820px,100%)] sm:max-w-[32rem] sm:rounded-[2rem]"
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="absolute left-0 right-0 top-0 z-20 space-y-4 p-4">
          <div className="flex gap-1">
            {group.stories.map((item, index) => (
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/30" key={item.id}>
                <span
                  className="block h-full rounded-full bg-white transition-all"
                  style={{ width: `${index < storyIndex ? 100 : index === storyIndex ? progress : 0}%` }}
                />
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 text-white">
            <div>
              <p className="text-sm font-semibold">{group.authorName}</p>
              <p className="text-xs text-white/70">Story</p>
            </div>
            <div className="flex items-center gap-2">
              {canDeleteStory?.(story) ? (
                <button
                  aria-label="Excluir Story"
                  className="rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-red-500/80 disabled:opacity-60"
                  disabled={deletingStoryId === story.id}
                  onClick={() => onDelete?.(story.id)}
                  type="button"
                >
                  {deletingStoryId === story.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                </button>
              ) : null}
              <button className="rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/20" onClick={onClose} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {story.tipo === StoryKind.IMAGE && story.imagem ? (
          <img alt={story.imagem.alt ?? 'Story'} className="h-full w-full object-cover" decoding="async" src={getAssetUrl(story.imagem.url)} />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center" style={{ background: story.fundo }}>
            <p className="whitespace-pre-wrap break-words text-3xl font-semibold leading-tight text-white">{story.texto}</p>
          </div>
        )}
        <button aria-label="Story anterior" className="absolute bottom-0 left-0 top-24 z-10 w-1/2" onClick={goPrevious} type="button" />
        <button aria-label="Proximo story" className="absolute bottom-0 right-0 top-24 z-10 w-1/2" onClick={goNext} type="button" />
      </motion.div>
    </div>
  );
}
