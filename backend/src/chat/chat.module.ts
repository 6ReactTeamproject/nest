import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { User } from '../user/entities/user.entity';
import { ChatMessage } from '../user/entities/chat-message.entity';
import { ChatRoom } from '../user/entities/chat-room.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatMessage, ChatRoom]),
    JwtModule.register({}), 
    UserModule, 
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService], 
})
export class ChatModule {}
