/**
 * 게시글 컨트롤러
 * 게시글 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 게시글 조회, 작성, 수정, 삭제, 조회수 증가 기능 제공
 * - 인증 처리: JWT 가드를 사용하여 인증된 사용자만 작성/수정/삭제 가능
 * - 권한 검증: 작성자 본인만 수정/삭제 가능하도록 보안 강화
 * - Swagger 문서화: API 문서 자동 생성
 */

import {
  Controller,
  Get,
  Post as PostMethod,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { Post as PostEntity } from 'src/user/entities/posts.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 모든 게시글 조회
   * 전체 게시글 목록을 가져오거나 특정 사용자의 게시글만 가져옵니다.
   * 
   * 왜 필요한가?
   * - 게시글 목록 표시: 게시판에서 게시글 목록을 보여주기 위해
   * - 사용자별 필터링: userId 쿼리 파라미터로 특정 사용자의 게시글만 조회 가능
   * - 공개 API: 인증 없이도 조회 가능 (모든 사용자가 게시글을 볼 수 있음)
   * 
   * @param userId 선택적 쿼리 파라미터: 특정 사용자의 게시글만 조회
   * @returns 게시글 배열
   */
  @Get('all')
  async getAll(@Query('userId') userId?: number): Promise<PostEntity[]> {
    // userId가 있으면 해당 사용자의 게시글만 조회
    // 왜 이렇게 하나? 마이페이지에서 사용자가 작성한 게시글만 보여주기 위해
    if (userId) {
      return await this.postsService.getByUserId(Number(userId));
    }
    // userId가 없으면 전체 게시글 조회
    return await this.postsService.getAll();
  }

  /**
   * 게시글 기본 정보 조회
   * 게시글의 기본 정보만 가져옵니다 (프론트엔드 최적화용).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 게시글 기본 정보 배열
   */
  @Get('info')
  async getInfo() {
    const result = await this.postsService.getBasicInfo();
    return {
      message: 'Posts의 기본',
      data: result,
    };
  }

  /**
   * 게시글 조회수 증가
   * 게시글을 조회할 때마다 조회수를 증가시킵니다.
   * 
   * 왜 필요한가?
   * - 조회수 추적: 게시글의 인기도를 파악하기 위해
   * - 인증 불필요: 모든 사용자가 조회할 수 있으므로 인증 불필요
   * 
   * @param id 게시글 ID
   * @returns 성공 메시지
   */
  @ApiOperation({ summary: '게시글 조회수 증가' })
  @ApiResponse({ status: 200, description: '조회수 증가 성공' })
  @Patch(':id/view')
  async incrementViews(@Param('id') id: number): Promise<{ message: string }> {
    await this.postsService.incrementViews(id);
    return { message: 'Views incremented' };
  }

  /**
   * 단일 게시글 조회
   * 특정 게시글의 상세 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 게시글 상세 표시: 게시글 상세 페이지에서 전체 내용을 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능
   * 
   * @param id 게시글 ID
   * @returns 게시글 정보
   */
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<PostEntity> {
    return await this.postsService.getOne(id);
  }

  /**
   * 게시글 작성
   * 새로운 게시글을 작성합니다.
   * 
   * 왜 필요한가?
   * - 게시글 작성 기능: 사용자가 게시글을 작성할 수 있게 함
   * - 인증 필요: 로그인한 사용자만 게시글 작성 가능
   * - 자동 사용자 정보: JWT에서 사용자 ID를 추출하여 자동으로 설정
   * 
   * @param createPostDto 게시글 작성 데이터 (제목, 내용, 이미지)
   * @param user 현재 로그인한 사용자 정보 (JWT에서 추출)
   * @returns 생성된 게시글
   */
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @UseGuards(JwtAuthGuard)
  @PostMethod()
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<PostEntity> {
    // 스프레드 연산자로 DTO와 userId를 병합하여 서비스에 전달
    // 왜 이렇게 하나? 클라이언트가 userId를 보내면 안 되므로 서버에서 설정
    return await this.postsService.create({ ...createPostDto, userId: user.userId });
  }

  /**
   * 게시글 수정
   * 기존 게시글을 수정합니다.
   * 
   * 왜 필요한가?
   * - 게시글 수정 기능: 사용자가 작성한 게시글을 수정할 수 있게 함
   * - 권한 검증: 작성자 본인만 수정 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 수정 가능
   * 
   * @param id 게시글 ID
   * @param updatePostDto 수정할 게시글 데이터
   * @param user 현재 로그인한 사용자 정보
   * @returns 수정된 게시글
   */
  @ApiOperation({ summary: '게시글 수정' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '게시글 수정 성공' })
  @ApiResponse({ status: 403, description: '본인의 글만 수정 가능' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: { userId: number; loginId: string },
  ): Promise<PostEntity> {
    return await this.postsService.update(id, updatePostDto, user.userId);
  }

  /**
   * 게시글 삭제
   * 게시글을 삭제합니다.
   * 
   * 왜 필요한가?
   * - 게시글 삭제 기능: 사용자가 작성한 게시글을 삭제할 수 있게 함
   * - 권한 검증: 작성자 본인만 삭제 가능 (서비스에서 처리)
   * - 인증 필요: 로그인한 사용자만 삭제 가능
   * 
   * @param id 게시글 ID
   * @param user 현재 로그인한 사용자 정보
   * @returns 삭제 성공 메시지
   */
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 403, description: '본인의 글만 삭제 가능' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: { userId: number; loginId: string }) {
    await this.postsService.remove(id, user.userId);
    return { message: `Post with id ${id} deleted.` };
  }
}
