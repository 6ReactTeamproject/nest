/**
 * 쪽지 컨트롤러
 * 쪽지(메시지) 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 쪽지 조회, 작성, 수정 기능 제공
 * - 인증 처리: JWT 가드를 사용하여 인증된 사용자만 접근 가능
 * - 권한 검증: 발신자나 수신자만 수정 가능하도록 보안 강화
 * - Swagger 문서화: API 문서 자동 생성
 */

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

  /**
   * 전체 쪽지 조회
   * 모든 쪽지를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 쪽지 목록 표시: 사용자가 받은/보낸 쪽지 목록을 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능 (모든 쪽지를 볼 수 있음)
   * 
   * @returns 쪽지 배열
   */
  @Get('all')
  async getAll(): Promise<Message[]> {
    return await this.messageService.getAll();
  }

  /**
   * 쪽지 생성
   * 새로운 쪽지를 작성합니다.
   * 
   * 왜 필요한가?
   * - 쪽지 작성 기능: 사용자가 다른 사용자에게 쪽지를 보낼 수 있게 함
   * - 인증 필요: 로그인한 사용자만 쪽지 작성 가능
   * - 자동 발신자 정보: JWT에서 사용자 ID를 추출하여 자동으로 설정
   * 
   * @param createMessageDto 쪽지 작성 데이터 (수신자 ID, 제목, 내용)
   * @param user 현재 로그인한 사용자 정보 (JWT에서 추출)
   * @returns 생성된 쪽지
   */
  @ApiOperation({ summary: '쪽지 생성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '쪽지 생성 성공' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Message> {
    // 스프레드 연산자로 DTO와 senderId를 병합하여 서비스에 전달
    // 왜 이렇게 하나? 클라이언트가 senderId를 보내면 안 되므로 서버에서 설정
    return await this.messageService.create({
      ...createMessageDto,
      senderId: user.userId,
    });
  }

  /**
   * 쪽지 수정
   * 쪽지를 수정합니다 (예: 읽음 처리).
   * 
   * 왜 필요한가?
   * - 읽음 처리: 쪽지를 읽었는지 표시하기 위해
   * - 권한 검증: 발신자나 수신자만 수정 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 수정 가능
   * 
   * @param id 쪽지 ID
   * @param updateMessageDto 수정할 쪽지 데이터
   * @param user 현재 로그인한 사용자 정보
   * @returns 수정된 쪽지
   */
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
