import { Types } from 'mongoose';

import { PostModel, type PostDocument } from '../models/post.model';
import { StoryModel, type StoryDocument } from '../models/story.model';
import type { CreatePostData, CreateStoryData, ListPostsOptions, ReactionEmoji, UpdatePostData } from '../types/feed.types';

export class FeedRepository {
  async create(data: CreatePostData): Promise<PostDocument> {
    const post = await PostModel.create({
      autor: data.autor,
      texto: data.texto,
      imagens: data.imagem ? [data.imagem] : []
    });

    return post.populate('autor');
  }

  async list({ limit, page }: ListPostsOptions): Promise<PostDocument[]> {
    return PostModel.find()
      .populate('autor')
      .sort({ fixado: -1, data: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async count(): Promise<number> {
    return PostModel.countDocuments();
  }

  async listByAuthor(authorId: string, { limit, page }: ListPostsOptions): Promise<PostDocument[]> {
    return PostModel.find({ autor: authorId })
      .populate('autor')
      .sort({ data: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async countByAuthor(authorId: string): Promise<number> {
    return PostModel.countDocuments({ autor: authorId });
  }

  async countActiveStoriesByAuthor(authorId: string): Promise<number> {
    return StoryModel.countDocuments({ autor: authorId, expiraEm: { $gt: new Date() } });
  }

  async countReactionsReceivedByAuthor(authorId: string): Promise<number> {
    const [result] = await PostModel.aggregate<{ total: number }>([
      { $match: { autor: new Types.ObjectId(authorId) } },
      { $project: { total: { $size: { $ifNull: ['$reacoes', []] } } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return result?.total ?? 0;
  }

  async findById(postId: string): Promise<PostDocument | null> {
    return PostModel.findById(postId).populate('autor');
  }

  async updatePost(postId: string, data: UpdatePostData): Promise<PostDocument | null> {
    const updateData: Record<string, unknown> = {};

    if (data.texto !== undefined) {
      updateData.texto = data.texto;
    }

    if (data.imagem !== undefined) {
      updateData.imagens = [data.imagem];
    }

    return PostModel.findByIdAndUpdate(postId, updateData, { new: true }).populate('autor');
  }

  async react(postId: string, userId: string, emoji: ReactionEmoji): Promise<PostDocument | null> {
    const post = await PostModel.findById(postId);

    if (!post) {
      return null;
    }

    post.reacoes = post.reacoes ?? [];

    const existingReaction = post.reacoes.find((reaction) => reaction.usuario.toString() === userId);

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      post.reacoes.push({ usuario: new Types.ObjectId(userId), emoji });
    }

    await post.save();

    return post.populate('autor');
  }

  async setPinned(postId: string, pinned: boolean): Promise<PostDocument | null> {
    return PostModel.findByIdAndUpdate(postId, { fixado: pinned }, { new: true }).populate('autor');
  }

  async delete(postId: string): Promise<void> {
    await PostModel.findByIdAndDelete(postId);
  }

  async deletePostsByAuthor(authorId: string): Promise<PostDocument[]> {
    const posts = await PostModel.find({ autor: authorId });
    await PostModel.deleteMany({ autor: authorId });

    return posts;
  }

  async createStory(data: CreateStoryData): Promise<StoryDocument> {
    const story = await StoryModel.create({
      autor: data.autor,
      tipo: data.tipo,
      texto: data.texto,
      imagem: data.imagem,
      fundo: data.fundo,
      expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return story.populate('autor');
  }

  async listActiveStories(): Promise<StoryDocument[]> {
    return StoryModel.find({ expiraEm: { $gt: new Date() } }).populate('autor').sort({ data: 1 });
  }

  async listActiveStoriesByAuthor(authorId: string): Promise<StoryDocument[]> {
    return StoryModel.find({ autor: authorId, expiraEm: { $gt: new Date() } }).populate('autor').sort({ data: -1 }).limit(12);
  }

  async findStoryById(storyId: string): Promise<StoryDocument | null> {
    return StoryModel.findById(storyId).populate('autor');
  }

  async markStoryAsViewed(storyId: string, userId: string): Promise<StoryDocument | null> {
    const story = await StoryModel.findById(storyId);

    if (!story) {
      return null;
    }

    const alreadyViewed = story.visualizacoes.some((viewerId) => viewerId.toString() === userId);

    if (!alreadyViewed) {
      story.visualizacoes.push(new Types.ObjectId(userId));
      await story.save();
    }

    return story.populate('autor');
  }

  async deleteStory(storyId: string): Promise<void> {
    await StoryModel.findByIdAndDelete(storyId);
  }

  async deleteStoriesByAuthor(authorId: string): Promise<StoryDocument[]> {
    const stories = await StoryModel.find({ autor: authorId });
    await StoryModel.deleteMany({ autor: authorId });

    return stories;
  }

  async removeUserActivity(userId: string): Promise<void> {
    await Promise.all([
      PostModel.updateMany({}, { $pull: { reacoes: { usuario: userId } } }),
      StoryModel.updateMany({}, { $pull: { visualizacoes: userId } })
    ]);
  }
}
