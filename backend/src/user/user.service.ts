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

  // 전체 조회
  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // 사용자 기본 정보 조회
  async getBasicInfo(): Promise<Partial<User>[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'giturl', 'image'],
      order: { id: 'ASC' },
    });
  }

  // 단일 조회
  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 수정
  async update(id: number, data: Partial<User> & { currentPassword?: string }): Promise<User> {
    const user = await this.getOne(id);
    
    // 비밀번호 변경 시 현재 비밀번호 검증 필수
    if (data.password) {
      if (!data.currentPassword) {
        throw new BadRequestException('현재 비밀번호를 입력해주세요.');
      }
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
      }
      // 새 비밀번호 해싱
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    // currentPassword는 DB에 저장하지 않으므로 제거
    const { currentPassword, ...updateData } = data;
    await this.userRepository.update(id, updateData);
    return this.getOne(id);
  }
}
