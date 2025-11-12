import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/user/entities/members.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 모든 멤버 조회 (✅ 'relations' 제거)
  async findAll(): Promise<Member[]> {
    // 'user' 정보가 JOIN되지 않습니다.
    return this.memberRepository.find();
  }

  // ee 함수 (QueryBuilder 사용 - 원래대로)
  async ee(): Promise<Partial<Member>[]> {
    return await this.memberRepository
      .createQueryBuilder('member')
      .select([
        'member.id',
        'member.name',
        'member.imageUrl',
        'member.introduction',
        'member.authorId',
      ])
      .getMany();
  }

  // 특정 멤버 조회 (✅ 'relations' 제거)
  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: id },
      // 'relations: ['user']'가 없으므로 'member.user'는 undefined가 됩니다.
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    return member;
  }

  // 멤버 생성 (save 사용 - 원래대로)
  // 'user' 관계를 '쓰는' 작업이므로 코드는 동일합니다.
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
      user: { id: data.userId }, // 👈 관계 쓰기
    });

    try {
      return await this.memberRepository.save(newMember);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new NotFoundException(
          `User ID ${data.userId}는 이미 Member를 가지고 있습니다.`,
        );
      }
      throw error;
    }
  }

  // 멤버 수정 (save 사용 - 원래대로)
  // 'update'는 'findOne'을 호출합니다.
  // 이 findOne은 'user' 정보를 가져오지 않지만,
  // 'updateData'로 'user' 관계를 수정하는 것은 여전히 가능합니다.
  async update(id: number, updateData: Partial<Member>): Promise<Member> {
    // 1. 여기서 'user' 정보가 빠진 'existingMember'를 가져옵니다.
    const existingMember = await this.findOne(id);

    // 2. 만약 updateData에 { user: { id: 2 } }가 있다면
    //    'user' 정보가 없던 existingMember에 새 'user' 관계가 합쳐집니다.
    const updatedMember = this.memberRepository.merge(
      existingMember,
      updateData,
    );

    try {
      return await this.memberRepository.save(updatedMember);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new NotFoundException(
          `수정하려는 정보(User ID)가 이미 다른 Member에 의해 사용 중입니다.`,
        );
      }
      throw error;
    }
  }

  // 멤버 삭제 (delete 사용 - 원래대로)
  async remove(id: number): Promise<void> {
    const deleteResult = await this.memberRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
  }
}