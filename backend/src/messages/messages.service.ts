/**
 * 쪽지 서비스
 * 쪽지 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 쪽지 관리: 쪽지 조회, 생성, 수정 등의 핵심 로직 처리
 * - 권한 검증: 쪽지 수정 시 발신자나 수신자인지 확인
 * - 데이터 무결성: 쪽지 존재 여부 확인 및 검증
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/user/entities/messages.entity';

@Injectable()
export class MessageService {
  constructor(
    // TypeORM Repository 주입: 쪽지 엔티티에 대한 데이터베이스 작업 수행
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  /**
   * 전체 쪽지 조회
   * 모든 쪽지를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 쪽지 목록: 프론트엔드에서 쪽지 목록을 표시하기 위해
   * 
   * @returns 쪽지 배열
   */
  async getAll(): Promise<Message[]> {
    return await this.messageRepository.find();
  }

  /**
   * 쪽지 생성
   * 새로운 쪽지를 생성합니다.
   * 
   * 왜 필요한가?
   * - 쪽지 작성: 사용자가 다른 사용자에게 쪽지를 보낼 수 있게 함
   * - 데이터 저장: 쪽지 내용을 데이터베이스에 저장
   * 
   * @param data 쪽지 데이터 (발신자 ID, 수신자 ID, 제목, 내용)
   * @returns 생성된 쪽지
   */
  async create(data: Partial<Message>): Promise<Message> {
    // create: 엔티티 인스턴스 생성 (아직 DB에 저장되지 않음)
    const message = this.messageRepository.create(data);
    // save: 실제로 데이터베이스에 저장
    return await this.messageRepository.save(message);
  }

  /**
   * 쪽지 수정
   * 쪽지를 수정합니다 (예: 읽음 처리).
   * 
   * 왜 필요한가?
   * - 읽음 처리: 쪽지를 읽었는지 표시하기 위해
   * - 권한 검증: 발신자나 수신자만 수정 가능하도록 보안 강화
   * - 데이터 무결성: 쪽지가 존재하는지 확인
   * 
   * @param id 쪽지 ID
   * @param data 수정할 데이터
   * @param userId 현재 사용자 ID
   * @returns 수정된 쪽지
   * @throws ForbiddenException 발신자나 수신자가 아닐 경우
   */
  async update(
    id: number,
    data: Partial<Message>,
    userId: number,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    // 발신자나 수신자만 수정 가능
    // 왜 이렇게 하나? 쪽지는 발신자와 수신자 모두 읽음 처리 등을 할 수 있어야 하므로
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('본인의 메시지만 수정할 수 있습니다.');
    }
    await this.messageRepository.update(id, data);
    // 업데이트 후 업데이트된 메시지 반환
    return this.getOne(id);
  }

  /**
   * 단일 쪽지 조회 (내부 사용)
   * 특정 쪽지의 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 쪽지 상세 정보: 쪽지의 상세 정보를 보기 위해
   * - 데이터 무결성: 쪽지가 존재하는지 확인
   * - private: 외부에서 직접 호출하지 않고 내부에서만 사용
   * 
   * @param id 쪽지 ID
   * @returns 쪽지 정보
   * @throws NotFoundException 쪽지가 존재하지 않을 경우
   */
  private async getOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}
