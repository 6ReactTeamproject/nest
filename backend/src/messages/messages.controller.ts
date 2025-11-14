import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessageService } from './messages.service';
import { Message } from 'src/user/entities/messages.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags('쪽지')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // 전체 메시지 조회
  @Get('all')
  async getAll(): Promise<Message[]> {
    return await this.messageService.getAll();
  }

  @ApiOperation({ summary: '쪽지 생성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '쪽지 생성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Message> {
    return await this.messageService.create({
      ...createMessageDto,
      senderId: user.userId,
    });
  }

  // 메시지 수정 (읽음 처리 등, 본인 메시지만)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @GetUser() user: { userId: number; loginId: string },
  ) {
    return await this.messageService.update(id, updateMessageDto, user.userId);
  }

}
