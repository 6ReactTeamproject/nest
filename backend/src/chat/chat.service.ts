/**
 * 채팅 서비스
 * 채팅 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 
 * 왜 필요한가?
 * - 사용자 관리: 연결된 사용자 정보 관리
 * - 방 관리: 방 입장/나가기 검증 및 처리
 * - 메시지 검증: 메시지 유효성 검사
 * - 비즈니스 로직 분리: Gateway는 이벤트 처리만, Service는 비즈니스 로직 처리
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessage } from '../user/entities/chat-message.entity';
import { ChatRoom } from '../user/entities/chat-room.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
  ) {}

  // 연결된 사용자 정보 저장 (socketId -> userInfo)
  private connectedUsers = new Map<
    string,
    { userId: number; username: string }
  >();

  /**
   * 사용자 연결 등록
   * WebSocket 연결 시 사용자 정보를 저장합니다.
   * 
   * @param socketId 소켓 ID
   * @param userInfo 사용자 정보
   */
  addUser(socketId: string, userInfo: { userId: number; username: string }) {
    this.connectedUsers.set(socketId, userInfo);
  }

  /**
   * 사용자 연결 해제
   * WebSocket 연결 해제 시 사용자 정보를 제거합니다.
   * 
   * @param socketId 소켓 ID
   */
  removeUser(socketId: string) {
    this.connectedUsers.delete(socketId);
  }

  /**
   * 사용자 정보 조회
   * 소켓 ID로 사용자 정보를 가져옵니다.
   * 
   * @param socketId 소켓 ID
   * @returns 사용자 정보 또는 undefined
   */
  getUser(socketId: string): { userId: number; username: string } | undefined {
    return this.connectedUsers.get(socketId);
  }

  /**
   * 방 입장 검증 및 처리
   * 방 입장 요청을 검증하고 처리합니다.
   * 
   * @param roomId 방 ID
   * @param username 사용자 이름
   * @returns 방 입장 성공 여부 및 메시지
   */
  validateJoinRoom(roomId: string, username: string): {
    success: boolean;
    message: string;
  } {
    // 방 ID 검증
    if (!roomId || roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    // 방 ID 길이 제한 (예: 50자)
    if (roomId.length > 50) {
      throw new BadRequestException('방 ID는 50자 이하여야 합니다.');
    }

    return {
      success: true,
      message: `${username}님이 방에 입장했습니다.`,
    };
  }

  /**
   * 방 나가기 검증 및 처리
   * 방 나가기 요청을 검증하고 처리합니다.
   * 
   * @param roomId 방 ID
   * @param username 사용자 이름
   * @returns 방 나가기 성공 여부 및 메시지
   */
  validateLeaveRoom(roomId: string, username: string): {
    success: boolean;
    message: string;
  } {
    // 방 ID 검증
    if (!roomId || roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    return {
      success: true,
      message: `${username}님이 방에서 나갔습니다.`,
    };
  }

  /**
   * 채팅 메시지 검증 및 처리
   * 채팅 메시지를 검증하고 처리합니다.
   * 
   * @param data 채팅 메시지 데이터
   * @param username 사용자 이름
   * @returns 검증된 메시지 페이로드
   */
  validateAndProcessMessage(
    data: ChatMessageDto,
    username: string,
  ): {
    username: string;
    message: string;
    time: string;
  } {
    // 메시지 검증
    if (!data.message || data.message.trim().length === 0) {
      throw new BadRequestException('메시지를 입력해주세요.');
    }

    // 메시지 길이 제한 (예: 1000자)
    if (data.message.length > 1000) {
      throw new BadRequestException('메시지는 1000자 이하여야 합니다.');
    }

    // 방 ID 검증
    if (!data.roomId || data.roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    // 메시지 페이로드 생성
    return {
      username: username,
      message: data.message.trim(),
      time: new Date().toISOString(),
    };
  }

  /**
   * 시스템 메시지 생성
   * 시스템 메시지를 생성합니다.
   * 
   * @param message 메시지 내용
   * @returns 시스템 메시지 페이로드
   */
  createSystemMessage(message: string): {
    message: string;
    time: string;
  } {
    return {
      message: message,
      time: new Date().toISOString(),
    };
  }

  /**
   * 채팅방 생성 또는 조회
   * 채팅방이 없으면 생성하고, 있으면 조회합니다.
   * 
   * @param roomId 방 ID
   * @param userId 생성자 ID (1:1 채팅방인 경우 첫 번째 사용자)
   * @returns 채팅방
   */
  async getOrCreateRoom(roomId: string, userId: number): Promise<ChatRoom> {
    let room = await this.chatRoomRepository.findOne({
      where: { roomId },
    });

    if (!room) {
      // 1:1 채팅방인지 확인 (private-로 시작)
      const isPrivateRoom = roomId.startsWith('private-');
      
      // 방 이름 생성
      let roomName = roomId;
      if (isPrivateRoom) {
        // 1:1 채팅방 이름은 "1:1 채팅"으로 설정
        roomName = '1:1 채팅';
      }

      // 새 방 생성
      room = this.chatRoomRepository.create({
        roomId,
        name: roomName,
        description: isPrivateRoom ? '1:1 채팅방' : null,
        createdBy: userId,
      });
      room = await this.chatRoomRepository.save(room);
    }

    return room;
  }

  /**
   * 채팅 메시지 저장
   * 채팅 메시지를 데이터베이스에 저장합니다.
   * 
   * @param roomId 방 ID
   * @param userId 사용자 ID
   * @param message 메시지 내용
   * @returns 저장된 메시지
   */
  async saveMessage(
    roomId: string,
    userId: number,
    message: string,
  ): Promise<ChatMessage> {
    // 방이 없으면 생성 (반드시 완료될 때까지 대기)
    const room = await this.getOrCreateRoom(roomId, userId);
    
    // 방이 제대로 생성되었는지 확인
    if (!room) {
      throw new BadRequestException(`방 생성에 실패했습니다: ${roomId}`);
    }

    const chatMessage = this.chatMessageRepository.create({
      roomId,
      userId,
      message,
    });
    return await this.chatMessageRepository.save(chatMessage);
  }

  /**
   * 방의 메시지 조회
   * 특정 방의 메시지 목록을 가져옵니다.
   * 
   * @param roomId 방 ID
   * @param limit 조회할 메시지 수 (기본값: 100)
   * @returns 메시지 배열
   */
  async getMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['user'],
    });
  }
}

