import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { CreatePostPayload, CreateStoryPayload, FeedPost, FeedResponse, FeedStory, ReactionEmoji } from '../types/feed';

type ListFeedParams = {
  page?: number;
  limit?: number;
};

export async function listFeedPosts({ limit = 10, page = 1 }: ListFeedParams = {}): Promise<FeedResponse> {
  const response = await api.get<ApiResponse<FeedResponse>>('/feed', {
    params: {
      page,
      limit
    }
  });

  return response.data.data;
}

function toFormData(payload: Record<string, File | string | undefined>): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  return formData;
}

export async function createFeedPost(payload: CreatePostPayload): Promise<FeedPost> {
  const response = await api.post<ApiResponse<{ publicacao: FeedPost }>>('/feed', toFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.publicacao;
}

export async function reactToFeedPost(postId: string, emoji: ReactionEmoji): Promise<FeedPost> {
  const response = await api.post<ApiResponse<{ publicacao: FeedPost }>>(`/feed/${postId}/reactions`, { emoji });

  return response.data.data.publicacao;
}

export async function setFeedPostPinned(postId: string, fixado: boolean): Promise<FeedPost> {
  const response = await api.patch<ApiResponse<{ publicacao: FeedPost }>>(`/feed/${postId}/pin`, { fixado });

  return response.data.data.publicacao;
}

export async function deleteFeedPost(postId: string): Promise<string> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/feed/${postId}`);

  return response.data.data.id;
}

export async function listFeedStories(): Promise<FeedStory[]> {
  const response = await api.get<ApiResponse<{ stories: FeedStory[] }>>('/feed/stories');

  return response.data.data.stories;
}

export async function createFeedStory(payload: CreateStoryPayload): Promise<FeedStory> {
  const response = await api.post<ApiResponse<{ story: FeedStory }>>('/feed/stories', toFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.story;
}

export async function markFeedStoryAsViewed(storyId: string): Promise<FeedStory> {
  const response = await api.post<ApiResponse<{ story: FeedStory }>>(`/feed/stories/${storyId}/view`);

  return response.data.data.story;
}
