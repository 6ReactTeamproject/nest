/**
 * 채팅 게이트웨이
 * WebSocket을 통한 실시간 채팅 기능을 제공합니다.
 *
 * 왜 필요한가?
 * - 실시간 통신: WebSocket을 사용하여 실시간 채팅 기능 구현
 * - 방 관리: 사용자들이 특정 방에 입장하여 채팅할 수 있게 함
 * - 메시지 브로드캐스트: 방에 있는 모든 사용자에게 메시지 전송
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatService } from './chat.service';
import { User } from '../user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // CORS 오타 수정: orgin -> origin
    credentials: true,
  },
  namespace: '/chat', // 네임스페이스 추가
  transports: ['websocket', 'polling'], // WebSocket과 polling 모두 허용
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // DTO 검증 파이프 추가
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 클라이언트 연결 처리
   * 클라이언트가 WebSocket에 연결될 때 호출됩니다.
   *
   * @param client 연결된 소켓 클라이언트
   */
  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      // JWT 토큰 추출 (auth 객체 또는 Authorization 헤더에서)
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`No token provided for client ${client.id}`);
        this.chatService.addUser(client.id, {
          userId: 0,
          username: '익명',
        });
        return;
      }

      // JWT 토큰 검증
      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        'your-secret-key-change-in-production';
      const payload = this.jwtService.verify(token, { secret });

      // 사용자 정보 조회
      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
        select: ['id', 'name'],
      });

      if (user) {
        this.chatService.addUser(client.id, {
          userId: user.id,
          username: user.name,
        });
        this.logger.log(`User ${user.name} (ID: ${user.id}) connected`);
      } else {
        this.logger.warn(`User not found for userId: ${payload.userId}`);
        this.chatService.addUser(client.id, {
          userId: 0,
          username: '익명',
        });
      }
    } catch (error) {
      this.logger.error(
        `Token verification failed for client ${client.id}:`,
        error.message,
      );
      // 토큰 검증 실패 시 익명 사용자로 등록
      this.chatService.addUser(client.id, {
        userId: 0,
        username: '익명',
      });
    }
  }

  /**
   * 클라이언트 연결 해제 처리
   * 클라이언트가 WebSocket 연결을 끊을 때 호출됩니다.
   *
   * @param client 연결 해제된 소켓 클라이언트
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = this.chatService.getUser(client.id);
    if (user) {
      // 사용자가 속한 모든 방에서 나가기 알림 (공개방 제외)
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room !== client.id) {
          // 공개방이 아닌 경우에만 퇴장 알림 전송 (1:1 채팅방만 알림)
          const isPublicRoom = ['general', 'travel', 'food'].includes(room);
          if (!isPublicRoom) {
            const systemMessage = {
              ...this.chatService.createSystemMessage(
                `${user.username} 님이 나갔습니다.`,
              ),
              roomId: room, // 프론트엔드에서 방별 메시지 저장을 위해 필요
            };
            client.to(room).emit('systemMessage', systemMessage);
          }
        }
      });
      this.chatService.removeUser(client.id);
    }
  }

  /**
   * 방 입장 처리
   * 클라이언트가 특정 방에 입장할 때 호출됩니다.
   *
   * @param client 연결된 소켓 클라이언트
   * @param data 방 입장 데이터 (roomId)
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';

      // 방 입장 검증
      this.chatService.validateJoinRoom(data.roomId, username);

      client.join(data.roomId);
      this.logger.log(`${username} joined room ${data.roomId}`);

      // 방의 기존 메시지 조회 및 전송 (최근 100개)
      const existingMessages = await this.chatService.getMessages(
        data.roomId,
        100,
      );

      // 기존 메시지를 클라이언트에 전송
      if (existingMessages.length > 0) {
        // 사용자 정보를 가져와서 메시지에 포함
        const messagesPayload = await Promise.all(
          existingMessages.map(async (msg) => {
            const user = await this.userRepository.findOne({
              where: { id: msg.userId },
              select: ['id', 'name'],
            });
            return {
              id: msg.id, // 메시지 ID 추가 (중복 제거 및 식별용)
              roomId: msg.roomId,
              userId: msg.userId,
              username: user?.name || '익명',
              message: msg.message,
              time: msg.createdAt.toISOString(),
              type: 'message',
            };
          }),
        );
        client.emit('chatHistory', messagesPayload);
      }

      // 공개방이 아닌 경우에만 입장 알림 전송 (1:1 채팅방만 알림)
      const isPublicRoom = ['general', 'travel', 'food'].includes(data.roomId);
      if (!isPublicRoom) {
        const systemMessage = {
          ...this.chatService.createSystemMessage(
            `${username} 님이 입장했습니다.`,
          ),
          roomId: data.roomId, // 프론트엔드에서 방별 메시지 저장을 위해 필요
        };
        client.to(data.roomId).emit('systemMessage', systemMessage);
      }

      // 발신자에게는 성공 메시지 전송
      client.emit('joinRoomSuccess', {
        roomId: data.roomId,
        message: '방에 입장했습니다.',
      });
    } catch (error) {
      this.logger.error('방 입장 실패:', error);
      client.emit('error', {
        message: error.message || '방 입장에 실패했습니다.',
      });
    }
  }

  /**
   * 방 나가기 처리
   * 클라이언트가 특정 방에서 나갈 때 호출됩니다.
   *
   * @param client 연결된 소켓 클라이언트
   * @param data 방 나가기 데이터 (roomId)
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';

      // 방 나가기 검증
      this.chatService.validateLeaveRoom(data.roomId, username);

      // 공개방이 아닌 경우에만 퇴장 알림 전송 (1:1 채팅방만 알림)
      const isPublicRoom = ['general', 'travel', 'food'].includes(data.roomId);
      if (!isPublicRoom) {
        const systemMessage = {
          ...this.chatService.createSystemMessage(
            `${username} 님이 나갔습니다.`,
          ),
          roomId: data.roomId, // 프론트엔드에서 방별 메시지 저장을 위해 필요
        };
        // 방에 있는 다른 사용자들에게 나가기 알림 (나가기 전에 전송)
        client.to(data.roomId).emit('systemMessage', systemMessage);
      }

      // 그 다음 방에서 나가기
      client.leave(data.roomId);
      this.logger.log(`${username} left room ${data.roomId}`);

      // 발신자에게는 성공 메시지 전송
      client.emit('leaveRoomSuccess', {
        roomId: data.roomId,
        message: '방에서 나갔습니다.',
      });
    } catch (error) {
      this.logger.error('방 나가기 실패:', error);
      client.emit('error', {
        message: error.message || '방 나가기에 실패했습니다.',
      });
    }
  }

  /**
   * 채팅 메시지 처리
   * 클라이언트가 채팅 메시지를 보낼 때 호출됩니다.
   *
   * @param client 연결된 소켓 클라이언트
   * @param data 채팅 메시지 데이터 (roomId, message)
   */
  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';
      const userId = user?.userId || 0;

      // 메시지 검증 및 처리 (Service에서 처리)
      const payload = this.chatService.validateAndProcessMessage(
        data,
        username,
      );

      // 메시지를 데이터베이스에 저장
      const savedMessage = await this.chatService.saveMessage(
        data.roomId,
        userId,
        payload.message,
      );

      // userId, roomId, id 추가 (프론트엔드에서 내 메시지 구분 및 방별 저장을 위해)
      const messagePayload = {
        ...payload,
        id: savedMessage.id, // 메시지 ID 추가 (중복 제거 및 식별용)
        userId: userId,
        roomId: data.roomId, // 프론트엔드에서 방별 메시지 저장을 위해 필요
      };

      // 방에 있는 모든 사용자에게 메시지 전송 (발신자 포함)
      this.server.to(data.roomId).emit('chatMessage', messagePayload);
    } catch (error) {
      this.logger.error('메시지 전송 실패:', error);
      client.emit('error', {
        message: error.message || '메시지 전송에 실패했습니다.',
      });
    }
  }
}
