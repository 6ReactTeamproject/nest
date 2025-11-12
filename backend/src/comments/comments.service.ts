import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/user/entities/comments.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  //search
  async search(keyword: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { text: Like(`%${keyword}%`) },
      relations: ['user', 'post'], // 작성자나 게시글 정보도 같이 불러올 수 있음
      order: { createdAt: 'DESC' }, // 최신순 정렬
    });
  }

  async getAll(): Promise<Comment[]> {
    return await this.commentsRepository.find();
  }

  async getOne(id: number): Promise<Comment> {
    const dsa = await this.commentsRepository.findOne({
      where: { id },
    });
    if (!dsa) {
      throw new NotFoundException('gg');
    }
    return dsa;
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    const comments = this.commentsRepository.create(data);
    return await this.commentsRepository.save(comments);
  }

  async update(id: number, data: Partial<Comment>): Promise<Comment> {
    await this.commentsRepository.update(id, data);
    return this.getOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.commentsRepository.delete(id);
  }

  async qq(): Promise<Partial<Comment>[]> {
    return await this.commentsRepository.find({
      select: ['id', 'text', 'likes', 'createdAt'],
    });
  }
}
