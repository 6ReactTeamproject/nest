import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/user/entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // 전체 조회
  async getAll(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 게시글 기본 정보 조회
  async getBasicInfo(): Promise<Partial<Post>[]> {
    return await this.postRepository.find({
      select: ['id', 'title', 'content', 'createdAt', 'views', 'userId'],
      order: { createdAt: 'DESC' },
    });
  }

  // 단일 조회
  async getOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // 생성
  async create(data: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(data);
    return await this.postRepository.save(post);
  }

  // 수정 (본인 글만)
  async update(id: number, data: Partial<Post>, userId: number): Promise<Post> {
    const post = await this.getOne(id);
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }
    await this.postRepository.update(id, data);
    return this.getOne(id);
  }

  // 삭제 (본인 글만)
  async remove(id: number, userId: number): Promise<void> {
    const post = await this.getOne(id);
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }
    await this.postRepository.delete(id);
  }

  // 조회수 증가 (인증 불필요)
  async incrementViews(id: number): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  // userId로 게시글 조회 (마이페이지 필터링용)
  async getByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

}
