/**
 * 게시글 서비스
 * 게시글 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 게시글 관리: 게시글 조회, 생성, 수정, 삭제 등의 핵심 로직 처리
 * - 권한 검증: 게시글 수정/삭제 시 작성자 본인인지 확인
 * - 조회수 관리: 게시글 조회 시 조회수 자동 증가
 * - 데이터 무결성: 게시글 존재 여부 확인 및 검증
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/user/entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    // TypeORM Repository 주입: 게시글 엔티티에 대한 데이터베이스 작업 수행
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * 전체 게시글 조회
   * 모든 게시글을 최신순으로 가져옵니다.
   * 
   * 왜 필요한가?
   * - 게시글 목록: 게시판에서 게시글 목록을 표시하기 위해
   * - 최신순 정렬: createdAt을 내림차순으로 정렬하여 최신 게시글이 위에 표시
   * 
   * @returns 게시글 배열 (최신순)
   */
  async getAll(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' }, // 최신순 정렬
    });
  }

  /**
   * 게시글 기본 정보 조회
   * 게시글의 기본 정보만 가져옵니다 (성능 최적화용).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 게시글 기본 정보 배열
   */
  async getBasicInfo(): Promise<Partial<Post>[]> {
    return await this.postRepository.find({
      select: ['id', 'title', 'content', 'createdAt', 'views', 'userId'], // 필요한 필드만 선택
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 단일 게시글 조회
   * 특정 게시글의 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 게시글 상세 정보: 게시글 상세 페이지에서 전체 내용을 보기 위해
   * - 데이터 무결성: 게시글이 존재하는지 확인
   * 
   * @param id 게시글 ID
   * @returns 게시글 정보
   * @throws NotFoundException 게시글이 존재하지 않을 경우
   */
  async getOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  /**
   * 게시글 생성
   * 새로운 게시글을 생성합니다.
   * 
   * 왜 필요한가?
   * - 게시글 작성: 사용자가 게시글을 작성할 수 있게 함
   * - 데이터 저장: 게시글 내용을 데이터베이스에 저장
   * 
   * @param data 게시글 데이터 (제목, 내용, 이미지, userId 등)
   * @returns 생성된 게시글
   */
  async create(data: Partial<Post>): Promise<Post> {
    // create: 엔티티 인스턴스 생성 (아직 DB에 저장되지 않음)
    const post = this.postRepository.create(data);
    // save: 실제로 데이터베이스에 저장
    return await this.postRepository.save(post);
  }

  /**
   * 게시글 수정
   * 기존 게시글을 수정합니다.
   * 
   * 왜 필요한가?
   * - 게시글 수정: 사용자가 작성한 게시글을 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능하도록 보안 강화
   * - 데이터 무결성: 게시글이 존재하는지 확인
   * 
   * @param id 게시글 ID
   * @param data 수정할 데이터
   * @param userId 현재 사용자 ID
   * @returns 수정된 게시글
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async update(id: number, data: Partial<Post>, userId: number): Promise<Post> {
    const post = await this.getOne(id);
    // 권한 검증: 작성자 본인인지 확인
    // 왜 필요한가? 다른 사용자의 게시글을 수정하는 것을 방지하기 위해
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }
    await this.postRepository.update(id, data);
    return this.getOne(id);
  }

  /**
   * 게시글 삭제
   * 게시글을 삭제합니다.
   * 
   * 왜 필요한가?
   * - 게시글 삭제: 사용자가 작성한 게시글을 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능하도록 보안 강화
   * - 데이터 무결성: 게시글이 존재하는지 확인
   * 
   * @param id 게시글 ID
   * @param userId 현재 사용자 ID
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async remove(id: number, userId: number): Promise<void> {
    const post = await this.getOne(id);
    // 권한 검증: 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }
    await this.postRepository.delete(id);
  }

  /**
   * 조회수 증가
   * 게시글의 조회수를 1 증가시킵니다.
   * 
   * 왜 필요한가?
   * - 조회수 추적: 게시글의 인기도를 파악하기 위해
   * - 원자적 연산: increment를 사용하여 동시성 문제 방지
   * 
   * @param id 게시글 ID
   */
  async incrementViews(id: number): Promise<void> {
    // increment: 원자적 연산으로 조회수를 증가
    // 왜 increment를 사용하나? 여러 요청이 동시에 들어와도 정확하게 증가시키기 위해
    await this.postRepository.increment({ id }, 'views', 1);
  }

  /**
   * 사용자별 게시글 조회
   * 특정 사용자가 작성한 게시글만 가져옵니다.
   * 
   * 왜 필요한가?
   * - 마이페이지: 사용자가 작성한 게시글 목록을 보여주기 위해
   * - 필터링: 특정 사용자의 게시글만 조회
   * 
   * @param userId 사용자 ID
   * @returns 해당 사용자의 게시글 배열 (최신순)
   */
  async getByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { userId }, // 특정 사용자의 게시글만 필터링
      order: { createdAt: 'DESC' },
    });
  }

}
