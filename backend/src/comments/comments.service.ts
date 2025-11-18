/**
 * 댓글 서비스
 * 댓글 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 댓글 관리: 게시글에 달린 댓글을 조회, 생성, 수정, 삭제
 * - 권한 검증: 댓글 수정/삭제 시 작성자 본인인지 확인
 * - 좋아요 기능: 댓글에 좋아요를 누르거나 취소하는 기능
 * - 데이터 무결성: 댓글 존재 여부 확인 및 권한 체크
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/user/entities/comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    // TypeORM Repository 주입: 댓글 엔티티에 대한 데이터베이스 작업 수행
    // 왜 주입하나? 의존성 주입을 통해 테스트 가능하고 유연한 코드 작성
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  /**
   * 게시글 ID로 댓글 조회
   * 특정 게시글에 달린 모든 댓글을 가져옵니다.
   * 
   * 왜 필요한가?
   * - 댓글 목록 표시: 게시글 상세 페이지에서 댓글 목록을 보여주기 위해
   * - 정렬: 생성일시 오름차순으로 정렬하여 최신 댓글이 아래에 표시
   * 
   * @param postId 게시글 ID
   * @returns 댓글 배열
   */
  async getByPostId(postId: number): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' }, // 오름차순 정렬: 먼저 작성된 댓글이 위에
    });
  }

  /**
   * 댓글 생성
   * 새로운 댓글을 생성합니다.
   * 
   * 왜 필요한가?
   * - 댓글 작성: 사용자가 게시글에 댓글을 작성할 수 있게 함
   * - 데이터 저장: 댓글 내용을 데이터베이스에 저장
   * 
   * @param data 댓글 데이터 (text, postId, userId, parentId 등)
   * @returns 생성된 댓글
   */
  async create(data: Partial<Comment>): Promise<Comment> {
    // create: 엔티티 인스턴스 생성 (아직 DB에 저장되지 않음)
    const comments = this.commentsRepository.create(data);
    // save: 실제로 데이터베이스에 저장
    return await this.commentsRepository.save(comments);
  }

  /**
   * 댓글 수정
   * 기존 댓글을 수정합니다.
   * 
   * 왜 필요한가?
   * - 댓글 수정: 사용자가 작성한 댓글을 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능하도록 보안 강화
   * - 데이터 무결성: 댓글이 존재하는지 확인
   * 
   * @param id 댓글 ID
   * @param data 수정할 데이터
   * @param userId 현재 사용자 ID
   * @returns 수정된 댓글
   */
  async update(
    id: number,
    data: Partial<Comment>,
    userId: number,
  ): Promise<Comment> {
    // 댓글 존재 여부 확인
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    // 권한 검증: 작성자 본인인지 확인
    // 왜 필요한가? 다른 사용자의 댓글을 수정하는 것을 방지하기 위해
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 수정할 수 있습니다.');
    }
    // update 대신 save 사용하여 한 번의 쿼리로 처리
    // Object.assign: 기존 댓글 객체에 수정할 데이터를 병합
    // 왜 이렇게 하나? 불필요한 쿼리를 줄이고 성능을 최적화하기 위해
    Object.assign(comment, data);
    return await this.commentsRepository.save(comment);
  }

  /**
   * 댓글 삭제
   * 댓글을 삭제합니다.
   * 
   * 왜 필요한가?
   * - 댓글 삭제: 사용자가 작성한 댓글을 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능하도록 보안 강화
   * - 데이터 무결성: 댓글이 존재하는지 확인
   * 
   * @param id 댓글 ID
   * @param userId 현재 사용자 ID
   */
  async remove(id: number, userId: number): Promise<void> {
    // 댓글 존재 여부 확인
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    // 권한 검증: 작성자 본인인지 확인
    // 왜 필요한가? 다른 사용자의 댓글을 삭제하는 것을 방지하기 위해
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }
    await this.commentsRepository.delete(id);
  }

  /**
   * 댓글 좋아요 토글
   * 댓글에 좋아요를 누르거나 취소합니다.
   * 
   * 왜 필요한가?
   * - 좋아요 기능: 사용자가 댓글에 좋아요를 표현할 수 있게 함
   * - 중복 방지: likedUserIds 배열로 같은 사용자가 여러 번 좋아요하는 것을 방지
   * - 좋아요 취소: 이미 좋아요한 경우 취소 가능
   * 
   * @param commentId 댓글 ID
   * @param userId 현재 사용자 ID
   * @returns 업데이트된 댓글
   */
  async toggleLike(commentId: number, userId: number): Promise<Comment> {
    // 댓글 존재 여부 확인
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 좋아요한 사용자 ID 배열 가져오기 (없으면 빈 배열)
    const likedUserIds = comment.likedUserIds || [];
    // 현재 사용자가 이미 좋아요를 눌렀는지 확인
    const isLiked = likedUserIds.includes(userId);

    if (isLiked) {
      // 좋아요 취소
      // Math.max: 좋아요 수가 음수가 되지 않도록 보장
      // 왜 필요한가? 데이터 무결성을 유지하기 위해
      comment.likes = Math.max(0, comment.likes - 1);
      // filter: 현재 사용자 ID를 제외한 배열 생성
      comment.likedUserIds = likedUserIds.filter((id) => id !== userId);
    } else {
      // 좋아요 추가
      comment.likes = comment.likes + 1;
      // 스프레드 연산자: 기존 배열에 새 사용자 ID 추가
      comment.likedUserIds = [...likedUserIds, userId];
    }

    return await this.commentsRepository.save(comment);
  }
}
