

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

  private connectedUsers = new Map<
    string,
    { userId: number; username: string }
  >();

  addUser(socketId: string, userInfo: { userId: number; username: string }) {
    this.connectedUsers.set(socketId, userInfo);
  }

  removeUser(socketId: string) {
    this.connectedUsers.delete(socketId);
  }

  getUser(socketId: string): { userId: number; username: string } | undefined {
    return this.connectedUsers.get(socketId);
  }

  validateJoinRoom(roomId: string, username: string): {
    success: boolean;
    message: string;
  } {
    
    if (!roomId || roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    if (roomId.length > 50) {
      throw new BadRequestException('방 ID는 50자 이하여야 합니다.');
    }

    return {
      success: true,
      message: `${username}님이 방에 입장했습니다.`,
    };
  }

  validateLeaveRoom(roomId: string, username: string): {
    success: boolean;
    message: string;
  } {
    
    if (!roomId || roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    return {
      success: true,
      message: `${username}님이 방에서 나갔습니다.`,
    };
  }

  validateAndProcessMessage(
    data: ChatMessageDto,
    username: string,
  ): {
    username: string;
    message: string;
    time: string;
  } {
    
    if (!data.message || data.message.trim().length === 0) {
      throw new BadRequestException('메시지를 입력해주세요.');
    }

    if (data.message.length > 1000) {
      throw new BadRequestException('메시지는 1000자 이하여야 합니다.');
    }

    if (!data.roomId || data.roomId.trim().length === 0) {
      throw new BadRequestException('방 ID를 입력해주세요.');
    }

    return {
      username: username,
      message: data.message.trim(),
      time: new Date().toISOString(),
    };
  }

  createSystemMessage(message: string): {
    message: string;
    time: string;
  } {
    return {
      message: message,
      time: new Date().toISOString(),
    };
  }

  async getOrCreateRoom(roomId: string, userId: number): Promise<ChatRoom> {
    let room = await this.chatRoomRepository.findOne({
      where: { roomId },
    });

    if (!room) {
      
      const isPrivateRoom = roomId.startsWith('private-');

      let roomName = roomId;
      if (isPrivateRoom) {
        
        roomName = '1:1 채팅';
      }

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

  async saveMessage(
    roomId: string,
    userId: number,
    message: string,
  ): Promise<ChatMessage> {
    
    const room = await this.getOrCreateRoom(roomId, userId);

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

  async getMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['user'],
    });
  }
}

