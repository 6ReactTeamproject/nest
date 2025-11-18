/**
 * 사용자 컨트롤러
 * 사용자 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 사용자 조회, 정보 수정 등의 기능 제공
 * - 인증 처리: JWT 가드를 사용하여 인증된 사용자만 접근 가능
 * - 권한 검증: 본인 정보만 수정할 수 있도록 보안 강화
 * - Swagger 문서화: API 문서 자동 생성
 */

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

// @ApiTags: Swagger 문서에서 이 컨트롤러를 '사용자' 그룹으로 분류
@ApiTags('사용자')
// @Controller: '/user' 경로로 시작하는 요청을 처리
@Controller('user')
export class UserController {
  // UserService 주입: 사용자 관련 비즈니스 로직 처리
  constructor(private readonly userService: UserService) {}

  /**
   * 전체 사용자 조회
   * 모든 사용자 정보를 가져옵니다.
   * 
   * 왜 필요한가?
   * - 사용자 목록 표시: 프론트엔드에서 사용자 목록을 보여주기 위해
   * - 공개 API: 인증 없이도 조회 가능 (모든 사용자 정보는 공개)
   * 
   * @returns 사용자 배열
   */
  @Get('all')
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }

  /**
   * 사용자 기본 정보 조회
   * 사용자의 기본 정보만 가져옵니다 (비밀번호 제외).
   * 
   * 왜 필요한가?
   * - 성능 최적화: 필요한 필드만 선택하여 조회 성능 향상
   * - 보안: 비밀번호 등 민감한 정보는 제외
   * - 프론트엔드 최적화: 프론트엔드에서 주로 사용하는 필드만 반환
   * 
   * @returns 사용자 기본 정보 배열
   */
  @Get('info')
  async getInfo() {
    const result = await this.userService.getBasicInfo();
    return {
      message: 'User 기본',
      data: result,
    };
  }

  /**
   * 사용자 정보 수정
   * 사용자 정보를 수정합니다.
   * 
   * 왜 필요한가?
   * - 사용자 정보 수정: 사용자가 자신의 정보를 수정할 수 있게 함
   * - 권한 검증: 본인만 수정 가능하도록 보안 강화
   * - 인증 필요: 로그인한 사용자만 수정 가능
   * 
   * @param id 사용자 ID (URL 파라미터)
   * @param updateUserDto 수정할 사용자 정보
   * @param user 현재 로그인한 사용자 정보 (JWT에서 추출)
   * @returns 수정된 사용자 정보
   */
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiBearerAuth('JWT-auth') // Swagger에서 JWT 인증 필요 표시
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '본인의 정보만 수정 가능' })
  @UseGuards(JwtAuthGuard) // JWT 인증 가드: 인증된 사용자만 접근 가능
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: { userId: number; loginId: string },
  ) {
    // 본인만 수정 가능 (id는 문자열로 받아오므로 숫자로 변환)
    // 왜 체크하나? 다른 사용자의 정보를 수정하는 것을 방지하기 위해
    const userId = Number(id);
    if (user.userId !== userId) {
      throw new ForbiddenException('본인의 정보만 수정할 수 있습니다.');
    }
    return await this.userService.update(userId, updateUserDto);
  }

}
