

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
    origin: 'http://localhost:5173', 
    credentials: true,
  },
  namespace: '/chat', 
  transports: ['websocket', 'polling'], 
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true })) 
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

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      
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

      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        'your-secret-key-change-in-production';
      const payload = this.jwtService.verify(token, { secret });

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
      
      this.chatService.addUser(client.id, {
        userId: 0,
        username: '익명',
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = this.chatService.getUser(client.id);
    if (user) {
      
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room !== client.id) {
          
          const isPublicRoom = ['general', 'travel', 'food'].includes(room);
          if (!isPublicRoom) {
            const systemMessage = {
              ...this.chatService.createSystemMessage(
                `${user.username} 님이 나갔습니다.`,
              ),
              roomId: room, 
            };
            client.to(room).emit('systemMessage', systemMessage);
          }
        }
      });
      this.chatService.removeUser(client.id);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';

      this.chatService.validateJoinRoom(data.roomId, username);

      client.join(data.roomId);
      this.logger.log(`${username} joined room ${data.roomId}`);

      const existingMessages = await this.chatService.getMessages(
        data.roomId,
        100,
      );

      if (existingMessages.length > 0) {
        
        const messagesPayload = await Promise.all(
          existingMessages.map(async (msg) => {
            const user = await this.userRepository.findOne({
              where: { id: msg.userId },
              select: ['id', 'name'],
            });
            return {
              id: msg.id, 
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

      const isPublicRoom = ['general', 'travel', 'food'].includes(data.roomId);
      if (!isPublicRoom) {
        const systemMessage = {
          ...this.chatService.createSystemMessage(
            `${username} 님이 입장했습니다.`,
          ),
          roomId: data.roomId, 
        };
        client.to(data.roomId).emit('systemMessage', systemMessage);
      }

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

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';

      this.chatService.validateLeaveRoom(data.roomId, username);

      const isPublicRoom = ['general', 'travel', 'food'].includes(data.roomId);
      if (!isPublicRoom) {
        const systemMessage = {
          ...this.chatService.createSystemMessage(
            `${username} 님이 나갔습니다.`,
          ),
          roomId: data.roomId, 
        };
        
        client.to(data.roomId).emit('systemMessage', systemMessage);
      }

      client.leave(data.roomId);
      this.logger.log(`${username} left room ${data.roomId}`);

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

  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageDto,
  ) {
    try {
      const user = this.chatService.getUser(client.id);
      const username = user?.username || '익명';
      const userId = user?.userId || 0;

      const payload = this.chatService.validateAndProcessMessage(
        data,
        username,
      );

      const savedMessage = await this.chatService.saveMessage(
        data.roomId,
        userId,
        payload.message,
      );

      const messagePayload = {
        ...payload,
        id: savedMessage.id, 
        userId: userId,
        roomId: data.roomId, 
      };

      this.server.to(data.roomId).emit('chatMessage', messagePayload);
    } catch (error) {
      this.logger.error('메시지 전송 실패:', error);
      client.emit('error', {
        message: error.message || '메시지 전송에 실패했습니다.',
      });
    }
  }
}
