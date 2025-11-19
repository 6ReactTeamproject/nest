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
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // CORS 오타 수정: orgin -> origin
    credentials: true,
  },
  namespace: '/chat', // 네임스페이스 추가 (선택사항)
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // DTO 검증 파이프 추가
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * 클라이언트 연결 처리
   * 클라이언트가 WebSocket에 연결될 때 호출됩니다.
   *
   * @param client 연결된 소켓 클라이언트
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // TODO: JWT 토큰 검증 및 사용자 정보 추출
    // const token = client.handshake.auth?.token;
    // const user = await this.validateToken(token);
    // this.chatService.addUser(client.id, user);
    // 임시로 익명 사용자 등록 (실제로는 JWT에서 가져와야 함)
    this.chatService.addUser(client.id, {
      userId: 0,
      username: '익명',
    });
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
      // 사용자가 속한 모든 방에서 나가기 알림
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room !== client.id) {
          // 시스템 메시지: 사용자가 나갔음을 알림
          const systemMessage = this.chatService.createSystemMessage(
            `${user.username} 님이 나갔습니다.`,
          );
          client.to(room).emit('systemMessage', systemMessage);
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
  handleJoinRoom(
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

      // 방에 있는 다른 사용자들에게 입장 알림 (발신자 제외)
      const systemMessage = this.chatService.createSystemMessage(
        `${username} 님이 입장했습니다.`,
      );
      client.to(data.roomId).emit('systemMessage', systemMessage);

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

      client.leave(data.roomId);
      this.logger.log(`${username} left room ${data.roomId}`);

      // 방에 있는 다른 사용자들에게 나가기 알림
      const systemMessage = this.chatService.createSystemMessage(
        `${username} 님이 나갔습니다.`,
      );
      client.to(data.roomId).emit('systemMessage', systemMessage);

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
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';

      // 메시지 검증 및 처리 (Service에서 처리)
      const payload = this.chatService.validateAndProcessMessage(
        data,
        username,
      );

      // 방에 있는 모든 사용자에게 메시지 전송 (발신자 포함)
      this.server.to(data.roomId).emit('chatMessage', payload);
    } catch (error) {
      this.logger.error('메시지 전송 실패:', error);
      client.emit('error', {
        message: error.message || '메시지 전송에 실패했습니다.',
      });
    }
  }
}
