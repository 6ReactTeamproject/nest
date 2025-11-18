/**
 * 여행지 소개 서비스
 * 여행지 소개(학기 소개) 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 여행지 소개 관리: 여행지 소개 조회, 생성, 수정, 삭제 등의 핵심 로직 처리
 * - 권한 검증: 여행지 소개 수정/삭제 시 작성자 본인인지 확인
 * - 데이터 무결성: 여행지 소개 존재 여부 확인 및 검증
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from 'src/user/entities/semester.entity';

@Injectable()
export class SemesterService {
  constructor(
    // TypeORM Repository 주입: 여행지 소개 엔티티에 대한 데이터베이스 작업 수행
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  /**
   * 전체 여행지 소개 조회
   * 모든 여행지 소개를 작성자 정보와 함께 가져옵니다.
   * 
   * 왜 필요한가?
   * - 여행지 목록: 여행지 소개 페이지에서 모든 여행지를 보여주기 위해
   * - 관계 포함: author 관계를 포함하여 작성자 정보도 함께 조회
   * 
   * @returns 여행지 소개 배열 (작성자 정보 포함)
   */
  async getAll(): Promise<Semester[]> {
    return await this.semesterRepository.find({
      relations: ['author'], // author 관계 포함: 작성자 정보도 함께 조회
    });
  }

  /**
   * 단일 여행지 소개 조회
   * 특정 여행지 소개의 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 여행지 상세 정보: 여행지 상세 페이지에서 전체 내용을 보기 위해
   * - 데이터 무결성: 여행지 소개가 존재하는지 확인
   * 
   * @param id 여행지 ID
   * @returns 여행지 소개 정보
   * @throws NotFoundException 여행지 소개가 존재하지 않을 경우
   */
  async getOne(id: number): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    return semester;
  }

  /**
   * 여행지 소개 생성
   * 새로운 여행지 소개를 생성합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 작성: 사용자가 여행지 소개를 작성할 수 있게 함
   * - 데이터 저장: 여행지 소개 내용을 데이터베이스에 저장
   * 
   * @param data 여행지 소개 데이터 (작성자 ID, 제목, 설명, 이미지)
   * @returns 생성된 여행지 소개
   */
  async create(data: Partial<Semester>): Promise<Semester> {
    // create: 엔티티 인스턴스 생성 (아직 DB에 저장되지 않음)
    const semester = this.semesterRepository.create(data);
    // save: 실제로 데이터베이스에 저장
    return await this.semesterRepository.save(semester);
  }

  /**
   * 여행지 소개 수정
   * 기존 여행지 소개를 수정합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 수정: 사용자가 작성한 여행지 소개를 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능하도록 보안 강화
   * - 데이터 무결성: 여행지 소개가 존재하는지 확인
   * 
   * @param id 여행지 ID
   * @param data 수정할 데이터
   * @param userId 현재 사용자 ID
   * @returns 수정된 여행지 소개
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async update(
    id: number,
    data: Partial<Semester>,
    userId: number,
  ): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['author'], // author 관계 포함: 작성자 ID 확인을 위해
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    // 권한 검증: 작성자 본인인지 확인
    // 왜 필요한가? 다른 사용자의 여행지 소개를 수정하는 것을 방지하기 위해
    if (semester.author.id !== userId) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }
    await this.semesterRepository.update(id, data);
    return this.getOne(id);
  }

  /**
   * 여행지 소개 삭제
   * 여행지 소개를 삭제합니다.
   * 
   * 왜 필요한가?
   * - 여행지 소개 삭제: 사용자가 작성한 여행지 소개를 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능하도록 보안 강화
   * - 데이터 무결성: 여행지 소개가 존재하는지 확인
   * 
   * @param id 여행지 ID
   * @param userId 현재 사용자 ID
   * @throws ForbiddenException 작성자 본인이 아닐 경우
   */
  async remove(id: number, userId: number): Promise<void> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }
    // 권한 검증: 작성자 본인인지 확인
    if (semester.author.id !== userId) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }
    await this.semesterRepository.delete(id);
  }

  /**
   * 여행지 기본 정보 조회
   * 여행지의 기본 정보만 가져옵니다 (성능 최적화용).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 여행지 기본 정보 배열 (id, title, description, imageUrl만 포함)
   */
  async getBasicInfo(): Promise<Partial<Semester>[]> {
    return await this.semesterRepository.find({
      select: ['id', 'title', 'description', 'imageUrl'], // 필요한 필드만 선택
    });
  }
}
