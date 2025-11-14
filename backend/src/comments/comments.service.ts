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

  // postId로 댓글 조회
  async getByPostId(postId: number): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
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
    // update 대신 save 사용하여 한 번의 쿼리로 처리
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

  // 댓글 좋아요 토글 (인증 필요, 본인 댓글도 좋아요 가능)
  async toggleLike(commentId: number, userId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likedUserIds = comment.likedUserIds || [];
    const isLiked = likedUserIds.includes(userId);

    if (isLiked) {
      // 좋아요 취소
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedUserIds = likedUserIds.filter((id) => id !== userId);
    } else {
      // 좋아요 추가
      comment.likes = comment.likes + 1;
      comment.likedUserIds = [...likedUserIds, userId];
    }

    return await this.commentsRepository.save(comment);
  }
}
