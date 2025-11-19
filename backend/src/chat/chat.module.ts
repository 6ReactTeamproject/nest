import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService],
  exports: [ChatService], // 다른 모듈에서도 사용할 수 있도록 export
})
export class ChatModule {}
