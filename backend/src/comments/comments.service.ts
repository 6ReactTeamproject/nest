import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/user/entities/comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  private normalizeLikedUserIds(likedUserIds: any): number[] {
    if (!likedUserIds) return [];
    if (Array.isArray(likedUserIds)) {
      return likedUserIds.map(id => Number(id)).filter(id => !isNaN(id));
    }
    if (typeof likedUserIds === 'string') {
      return likedUserIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => Number(id))
        .filter(id => !isNaN(id));
    }
    return [];
  }

  async getByPostId(postId: number): Promise<Comment[]> {
    const comments = await this.commentsRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
    
    return comments.map(comment => ({
      ...comment,
      likedUserIds: this.normalizeLikedUserIds(comment.likedUserIds),
    }));
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    const comments = this.commentsRepository.create(data);
    return await this.commentsRepository.save(comments);
  }

  async update(
    id: number,
    data: Partial<Comment>,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 수정할 수 있습니다.');
    }
    Object.assign(comment, data);
    return await this.commentsRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }
    await this.commentsRepository.delete(id);
  }

  async toggleLike(commentId: number, userId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likedUserIds = this.normalizeLikedUserIds(comment.likedUserIds);
    const isLiked = likedUserIds.includes(userId);

    if (isLiked) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedUserIds = likedUserIds.filter((id) => id !== userId);
    } else {
      comment.likes = comment.likes + 1;
      comment.likedUserIds = [...likedUserIds, userId];
    }

    const savedComment = await this.commentsRepository.save(comment);
    
    return {
      ...savedComment,
      likedUserIds: this.normalizeLikedUserIds(savedComment.likedUserIds),
    };
  }
}
