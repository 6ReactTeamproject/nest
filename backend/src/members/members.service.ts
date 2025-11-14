import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/user/entities/members.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 모든 멤버 조회
  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: ['user'], // user 관계 포함
    });
  }

  // 멤버 기본 정보 조회
  async getBasicInfo(): Promise<Partial<Member>[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.imageUrl',
        'member.introduction',
        'member.user_id',
      ])
      .getMany();
  }

  // 특정 멤버 조회
  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: id },
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    return member;
  }

  // 멤버 생성
  async create(data: {
    userId: number;
    name: string;
    introduction: string;
    imageUrl?: string;
  }): Promise<Member> {
    const newMember = this.memberRepository.create({
      name: data.name,
      introduction: data.introduction,
      imageUrl: data.imageUrl,
      user: { id: data.userId },
    });

    try {
      return await this.memberRepository.save(newMember);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `User ID ${data.userId}는 이미 Member를 가지고 있습니다.`,
        );
      }
      throw error;
    }
  }

  // 멤버 수정 (본인만)
  async update(
    id: number,
    updateData: Partial<Member>,
    userId: number,
  ): Promise<Member> {
    const existingMember = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!existingMember) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    if (existingMember.user.id !== userId) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다.');
    }
    const updatedMember = this.memberRepository.merge(
      existingMember,
      updateData,
    );

    try {
      return await this.memberRepository.save(updatedMember);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `수정하려는 정보(User ID)가 이미 다른 Member에 의해 사용 중입니다.`,
        );
      }
      throw error;
    }
  }

  // 멤버 삭제 (본인만)
  async remove(id: number, userId: number): Promise<void> {
    const existingMember = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!existingMember) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    if (existingMember.user.id !== userId) {
      throw new ForbiddenException('본인의 정보만 삭제할 수 있습니다.');
    }
    const deleteResult = await this.memberRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
  }
}