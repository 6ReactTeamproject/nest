/**
 * 멤버 소개 서비스
 * 멤버 소개 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 멤버 소개 관리: 멤버 소개 조회, 생성, 수정, 삭제 등의 핵심 로직 처리
 * - 권한 검증: 멤버 소개 수정/삭제 시 작성자 본인인지 확인
 * - 중복 방지: 한 사용자는 하나의 멤버 소개만 가질 수 있도록 보장
 * - 데이터 무결성: 멤버 소개 존재 여부 확인 및 검증
 */

import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/user/entities/members.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    // TypeORM Repository 주입: 멤버 소개 엔티티에 대한 데이터베이스 작업 수행
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  /**
   * 모든 멤버 소개 조회
   * 모든 멤버 소개를 사용자 정보와 함께 가져옵니다.
   * 
   * 왜 필요한가?
   * - 멤버 목록: 팀 소개 페이지에서 모든 멤버를 보여주기 위해
   * - 관계 포함: user 관계를 포함하여 사용자 정보도 함께 조회
   * 
   * @returns 멤버 소개 배열 (사용자 정보 포함)
   */
  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: ['user'], // user 관계 포함: 사용자 정보도 함께 조회
    });
  }

  /**
   * 멤버 기본 정보 조회
   * 멤버의 기본 정보만 가져옵니다 (성능 최적화용).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - Query Builder 사용: select를 사용하여 특정 필드만 선택
   * 
   * @returns 멤버 기본 정보 배열
   */
  async getBasicInfo(): Promise<Partial<Member>[]> {
    // Query Builder: 복잡한 쿼리를 작성할 때 사용
    // 왜 Query Builder를 사용하나? select로 특정 필드만 선택하기 위해
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

  /**
   * 특정 멤버 소개 조회
   * 특정 멤버 소개의 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 멤버 상세 정보: 멤버 상세 페이지에서 전체 내용을 보기 위해
   * - 데이터 무결성: 멤버 소개가 존재하는지 확인
   * 
   * @param id 멤버 ID
   * @returns 멤버 소개 정보
   * @throws NotFoundException 멤버 소개가 존재하지 않을 경우
   */
  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: id },
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    return member;
  }

  /**
   * 멤버 소개 생성
   * 새로운 멤버 소개를 생성합니다.
   * 
   * 왜 필요한가?
   * - 멤버 소개 작성: 사용자가 자신의 멤버 소개를 작성할 수 있게 함
   * - 데이터 저장: 멤버 소개 내용을 데이터베이스에 저장
   * - 중복 방지: 한 사용자는 하나의 멤버 소개만 가질 수 있도록 보장
   * 
   * @param data 멤버 소개 데이터 (userId, 이름, 소개, 이미지)
   * @returns 생성된 멤버 소개
   * @throws ConflictException 이미 멤버 소개가 존재할 경우
   */
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
      user: { id: data.userId }, // 관계 설정: user 객체로 설정
    });

    try {
      return await this.memberRepository.save(newMember);
    } catch (error: any) {
      // ER_DUP_ENTRY: 중복 키 오류 (한 사용자는 하나의 멤버 소개만 가질 수 있음)
      // 왜 체크하나? 데이터베이스 제약 조건 위반을 사용자 친화적 메시지로 변환
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `User ID ${data.userId}는 이미 Member를 가지고 있습니다.`,
        );
      }
      throw error;
    }
  }

  /**
   * 멤버 소개 수정
   * 기존 멤버 소개를 수정합니다.
   * 
   * 왜 필요한가?
   * - 멤버 소개 수정: 사용자가 자신의 멤버 소개를 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능하도록 보안 강화
   * - 데이터 무결성: 멤버 소개가 존재하는지 확인
   * 
   * @param id 멤버 ID
   * @param updateData 수정할 데이터
   * @param userId 현재 사용자 ID
   * @returns 수정된 멤버 소개
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async update(
    id: number,
    updateData: Partial<Member>,
    userId: number,
  ): Promise<Member> {
    const existingMember = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'], // user 관계 포함: 사용자 ID 확인을 위해
    });
    if (!existingMember) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    // 권한 검증: 작성자 본인인지 확인
    // 왜 필요한가? 다른 사용자의 멤버 소개를 수정하는 것을 방지하기 위해
    if (existingMember.user.id !== userId) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다.');
    }
    // merge: 기존 멤버 소개 객체에 수정할 데이터를 병합
    // 왜 merge를 사용하나? 불필요한 쿼리를 줄이고 성능을 최적화하기 위해
    const updatedMember = this.memberRepository.merge(
      existingMember,
      updateData,
    );

    try {
      return await this.memberRepository.save(updatedMember);
    } catch (error: any) {
      // ER_DUP_ENTRY: 중복 키 오류 처리
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `수정하려는 정보(User ID)가 이미 다른 Member에 의해 사용 중입니다.`,
        );
      }
      throw error;
    }
  }

  /**
   * 멤버 소개 삭제
   * 멤버 소개를 삭제합니다.
   * 
   * 왜 필요한가?
   * - 멤버 소개 삭제: 사용자가 자신의 멤버 소개를 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능하도록 보안 강화
   * - 데이터 무결성: 멤버 소개가 존재하는지 확인
   * 
   * @param id 멤버 ID
   * @param userId 현재 사용자 ID
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async remove(id: number, userId: number): Promise<void> {
    const existingMember = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!existingMember) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
    // 권한 검증: 작성자 본인인지 확인
    if (existingMember.user.id !== userId) {
      throw new ForbiddenException('본인의 정보만 삭제할 수 있습니다.');
    }
    const deleteResult = await this.memberRepository.delete(id);

    // affected: 삭제된 행의 수
    // 왜 체크하나? 삭제가 실제로 이루어졌는지 확인하기 위해
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }
  }
}