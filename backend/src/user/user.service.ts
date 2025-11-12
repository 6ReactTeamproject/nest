import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 전체 조회
  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async tt(): Promise<Partial<User>[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'giturl', 'image'],
      // order: 정렬순서 내림차순
      order: { id: 'ASC' },
    });
  }

  // 단일 조회
  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 생성
  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  // 수정
  async update(id: number, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.getOne(id);
  }

  // 삭제
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
