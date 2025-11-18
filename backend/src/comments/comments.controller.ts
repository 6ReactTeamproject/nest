/**
 * 댓글 컨트롤러
 * 댓글 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 댓글 조회, 작성, 수정, 삭제, 좋아요 기능 제공
 * - 인증 처리: JWT 가드를 사용하여 인증된 사용자만 접근 가능
 * - 요청 검증: DTO를 사용하여 요청 데이터 검증
 * - Swagger 문서화: API 문서 자동 생성
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { Comment } from 'src/user/entities/comments.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// @ApiTags: Swagger 문서에서 이 컨트롤러를 '댓글' 그룹으로 분류
@ApiTags('댓글')
// @Controller: '/comments' 경로로 시작하는 요청을 처리
@Controller('comments')
export class CommentsController {
  // CommentsService 주입: 댓글 관련 비즈니스 로직 처리
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * 게시글 ID로 댓글 조회
   * 특정 게시글에 달린 모든 댓글을 가져옵니다.
   * 
   * 왜 필요한가?
   * - 댓글 목록 표시: 게시글 상세 페이지에서 댓글 목록을 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능 (모든 사용자가 댓글을 볼 수 있음)
   * 
   * @param postId 게시글 ID (쿼리 파라미터)
   * @returns 댓글 배열
   */
  @Get()
  async getByPostId(@Query('postId') postId: number): Promise<Comment[]> {
    // postId가 없으면 빈 배열 반환
    // 왜 필요한가? 잘못된 요청에 대해 안전하게 처리하기 위해
    if (!postId) {
      return [];
    }
    // Number로 변환: 쿼리 파라미터는 문자열이므로 숫자로 변환
    return await this.commentsService.getByPostId(Number(postId));
  }

  /**
   * 댓글 작성
   * 새로운 댓글을 작성합니다.
   * 
   * 왜 필요한가?
   * - 댓글 작성 기능: 사용자가 게시글에 댓글을 작성할 수 있게 함
   * - 인증 필요: 로그인한 사용자만 댓글 작성 가능
   * - 자동 사용자 정보: JWT에서 사용자 ID를 추출하여 자동으로 설정
   * 
   * @param createCommentDto 댓글 작성 데이터 (text, postId, parentId)
   * @param user 현재 로그인한 사용자 정보 (JWT에서 추출)
   * @returns 생성된 댓글
   */
  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth('JWT-auth') // Swagger에서 JWT 인증 필요 표시
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @UseGuards(JwtAuthGuard) // JWT 인증 가드: 인증된 사용자만 접근 가능
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    // 스프레드 연산자로 DTO와 userId를 병합하여 서비스에 전달
    // 왜 이렇게 하나? 클라이언트가 userId를 보내면 안 되므로 서버에서 설정
    return await this.commentsService.create({ ...createCommentDto, userId: user.userId });
  }

  /**
   * 댓글 수정
   * 기존 댓글을 수정합니다.
   * 
   * 왜 필요한가?
   * - 댓글 수정 기능: 사용자가 작성한 댓글을 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 수정 가능
   * 
   * @param id 댓글 ID (URL 파라미터)
   * @param updateCommentDto 수정할 댓글 데이터
   * @param user 현재 로그인한 사용자 정보
   * @returns 수정된 댓글
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    return await this.commentsService.update(id, updateCommentDto, user.userId);
  }

  /**
   * 댓글 삭제
   * 댓글을 삭제합니다.
   * 
   * 왜 필요한가?
   * - 댓글 삭제 기능: 사용자가 작성한 댓글을 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 삭제 가능
   * 
   * @param id 댓글 ID (URL 파라미터)
   * @param user 현재 로그인한 사용자 정보
   * @returns 삭제 성공 메시지
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.commentsService.remove(id, user.userId);
    return { message: `Comment with id ${id} deleted.` };
  }

  /**
   * 댓글 좋아요 토글
   * 댓글에 좋아요를 누르거나 취소합니다.
   * 
   * 왜 필요한가?
   * - 좋아요 기능: 사용자가 댓글에 좋아요를 표현할 수 있게 함
   * - 토글 기능: 이미 좋아요한 경우 취소, 안 한 경우 추가
   * - 인증 필요: 로그인한 사용자만 좋아요 가능
   * 
   * @param id 댓글 ID (URL 파라미터)
   * @param user 현재 로그인한 사용자 정보
   * @returns 업데이트된 댓글 (좋아요 수 포함)
   */
  @ApiOperation({ summary: '댓글 좋아요 토글' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '좋아요 토글 성공' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  async toggleLike(
    @Param('id') id: number,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<Comment> {
    return await this.commentsService.toggleLike(id, user.userId);
  }
}
