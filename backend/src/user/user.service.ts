/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 사용자 관리: 사용자 조회, 정보 수정 등의 핵심 로직 처리
 * - 비밀번호 관리: 비밀번호 변경 시 현재 비밀번호 검증 및 해싱
 * - 데이터 무결성: 사용자 존재 여부 확인 및 검증
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    // TypeORM Repository 주입: 사용자 엔티티에 대한 데이터베이스 작업 수행
    // 왜 주입하나? 의존성 주입을 통해 테스트 가능하고 유연한 코드 작성
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 전체 사용자 조회
   * 모든 사용자 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 사용자 목록: 프론트엔드에서 사용자 목록을 표시하기 위해
   * - 작성자 정보: 게시글, 댓글 등의 작성자 정보를 찾기 위해
   * 
   * @returns 사용자 배열
   */
  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * 사용자 기본 정보 조회
   * 사용자의 기본 정보만 가져옵니다 (비밀번호 제외).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 보안: 비밀번호 등 민감한 정보는 제외
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 사용자 기본 정보 배열 (id, name, giturl, image만 포함)
   */
  async getBasicInfo(): Promise<Partial<User>[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'giturl', 'image'], // 필요한 필드만 선택
      order: { id: 'ASC' }, // ID 오름차순 정렬
    });
  }

  /**
   * 단일 사용자 조회
   * 특정 사용자의 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 사용자 상세 정보: 특정 사용자의 상세 정보를 보기 위해
   * - 데이터 무결성: 사용자가 존재하는지 확인
   * 
   * @param id 사용자 ID
   * @returns 사용자 정보
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * 사용자 정보 수정
   * 사용자 정보를 수정합니다.
   * 
   * 왜 필요한가?
   * - 사용자 정보 수정: 사용자가 자신의 정보를 수정할 수 있게 함
   * - 비밀번호 변경: 현재 비밀번호 검증 후 새 비밀번호로 변경
   * - 보안: 비밀번호는 해싱하여 저장
   * 
   * @param id 사용자 ID
   * @param data 수정할 데이터 (비밀번호 변경 시 currentPassword 필수)
   * @returns 수정된 사용자 정보
   * @throws BadRequestException 현재 비밀번호가 올바르지 않을 경우
   */
  async update(id: number, data: Partial<User> & { currentPassword?: string }): Promise<User> {
    const user = await this.getOne(id);
    
    // 비밀번호 변경 시 현재 비밀번호 검증 필수
    // 왜 필요한가? 다른 사람이 비밀번호를 변경하는 것을 방지하기 위해
    if (data.password) {
      if (!data.currentPassword) {
        throw new BadRequestException('현재 비밀번호를 입력해주세요.');
      }
      // 현재 비밀번호 검증: 해시된 비밀번호와 평문 비밀번호 비교
      // bcrypt.compare: 해시된 비밀번호와 평문 비밀번호를 비교
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
      }
      // 새 비밀번호 해싱: 평문 비밀번호를 해시로 변환하여 저장
      // 왜 해싱하나? 평문 비밀번호를 저장하면 보안 위험
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    // currentPassword는 DB에 저장하지 않으므로 제거
    // 구조 분해 할당: currentPassword를 제외한 나머지 필드만 추출
    const { currentPassword, ...updateData } = data;
    await this.userRepository.update(id, updateData);
    return this.getOne(id);
  }
}
