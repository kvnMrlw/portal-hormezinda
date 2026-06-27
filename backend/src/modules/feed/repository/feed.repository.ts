import { Types } from 'mongoose';

import { PostModel, type PostDocument } from '../models/post.model';
import type { CreatePostData, ListPostsOptions } from '../types/feed.types';

export class FeedRepository {
  async create(data: CreatePostData): Promise<PostDocument> {
    const post = await PostModel.create({
      autor: data.autor,
      texto: data.texto,
      imagens: []
    });

    return post.populate('autor');
  }

  async list({ limit, page }: ListPostsOptions): Promise<PostDocument[]> {
    return PostModel.find()
      .populate('autor')
      .sort({ data: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async count(): Promise<number> {
    return PostModel.countDocuments();
  }

  async like(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await PostModel.findById(postId);

    if (!post) {
      return null;
    }

    const alreadyLiked = post.curtidas.some((likeUserId) => likeUserId.toString() === userId);

    if (!alreadyLiked) {
      post.curtidas.push(new Types.ObjectId(userId));
      post.quantidadeCurtidas = post.curtidas.length;
      await post.save();
    }

    return post.populate('autor');
  }
}
