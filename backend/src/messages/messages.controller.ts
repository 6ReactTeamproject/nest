import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { MessageService } from './messages.service';
import { Message } from 'src/user/entities/messages.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // 전체 메시지 조회
  @Get('all')
  async getAll(): Promise<Message[]> {
    return await this.messageService.getAll();
  }

  @Get('info')
  //이름 바꿔야함
  async ww() {
    const result = await this.messageService.ww();
    return {
      message: 'Message의 기본',
      data: result,
    };
  }

  // 받은 메시지 목록
  @Get('received/:receiverId')
  async getReceived(@Param('receiverId') receiverId: number) {
    return await this.messageService.getReceivedMessages(receiverId);
  }

  // 보낸 메시지 목록
  @Get('sent/:senderId')
  async getSent(@Param('senderId') senderId: number) {
    return await this.messageService.getSentMessages(senderId);
  }

  // 단일 메시지 조회
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Message> {
    return await this.messageService.getOne(id);
  }

  // 메시지 생성
  @Post()
  async create(@Body() data: Partial<Message>): Promise<Message> {
    return await this.messageService.create(data);
  }

  // 메시지 수정 (읽음 처리 등)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: Partial<Message>) {
    return await this.messageService.update(id, data);
  }

  // 메시지 삭제
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.messageService.remove(id);
    return { message: 'Message deleted' };
  }
}
