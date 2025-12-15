

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getBasicInfo(): Promise<Partial<User>[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'giturl', 'image'], 
      order: { id: 'ASC' }, 
    });
  }

  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, data: Partial<User> & { currentPassword?: string }): Promise<User> {
    const user = await this.getOne(id);

    if (data.password) {
      if (!data.currentPassword) {
        throw new BadRequestException('현재 비밀번호를 입력해주세요.');
      }

      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
      }

      data.password = await bcrypt.hash(data.password, 10);
    }

    const { currentPassword, ...updateData } = data;
    await this.userRepository.update(id, updateData);
    return this.getOne(id);
  }
}
