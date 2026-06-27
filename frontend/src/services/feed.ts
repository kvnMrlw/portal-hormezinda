import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { FeedPost, FeedResponse } from '../types/feed';

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

export async function createFeedPost(texto: string): Promise<FeedPost> {
  const response = await api.post<ApiResponse<{ publicacao: FeedPost }>>('/feed', { texto });

  return response.data.data.publicacao;
}

export async function likeFeedPost(postId: string): Promise<FeedPost> {
  const response = await api.post<ApiResponse<{ publicacao: FeedPost }>>(`/feed/${postId}/like`);

  return response.data.data.publicacao;
}
