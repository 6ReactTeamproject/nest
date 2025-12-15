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

  async getAll(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getBasicInfo(): Promise<Partial<Post>[]> {
    return await this.postRepository.find({
      select: ['id', 'title', 'content', 'createdAt', 'views', 'userId'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async create(data: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(data);
    return await this.postRepository.save(post);
  }

  async update(id: number, data: Partial<Post>, userId: number): Promise<Post> {
    const post = await this.getOne(id);
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }
    await this.postRepository.update(id, data);
    return this.getOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.getOne(id);
    if (post.userId !== userId) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }
    await this.postRepository.delete(id);
  }

  async incrementViews(id: number): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  async getByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

}
