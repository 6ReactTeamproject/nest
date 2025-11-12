import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

  async rr(): Promise<Partial<Post>[]> {
    return await this.postRepository.find({
      select: ['id', 'title', 'content', 'createdAt', 'views'],
      // 내림차순
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

  // 수정
  async update(id: number, data: Partial<Post>): Promise<Post> {
    await this.postRepository.update(id, data);
    return this.getOne(id);
  }

  // 삭제
  async remove(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }

  // 제목 검색 기능 (옵션)
  async search(keyword: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { title: Like(`%${keyword}%`) },
    });
  }
}
