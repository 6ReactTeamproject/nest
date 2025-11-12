import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/user/entities/messages.entity';
import { MessageService } from './messages.service';
import { MessageController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
