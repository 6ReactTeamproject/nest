/**
 * 인증 관련 컨트롤러
 * 회원가입, 로그인, 로그아웃, 토큰 갱신 등의 인증 관련 API 엔드포인트를 제공합니다.
 */

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('인증') // Swagger 문서에서 '인증' 그룹으로 분류
@Controller('auth') // '/auth' 경로로 라우팅
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 회원가입 API
   * 새로운 사용자를 등록하고 JWT 토큰을 발급합니다.
   * @param registerDto 회원가입 정보 (아이디, 비밀번호, 이름 등)
   * @returns 액세스 토큰, 리프레시 토큰, 사용자 정보
   */
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 아이디' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * 로그인 API
   * 사용자 인증 후 JWT 토큰을 발급합니다.
   * @param loginDto 로그인 정보 (아이디, 비밀번호)
   * @returns 액세스 토큰, 리프레시 토큰, 사용자 정보
   */
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '로그인 정보가 올바르지 않음' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * 아이디 중복 확인 API
   * 회원가입 전 사용할 아이디의 중복 여부를 확인합니다.
   * @param loginId 확인할 아이디
   * @returns 중복 여부 (exists: boolean)
   */
  @ApiOperation({ summary: '아이디 중복 확인' })
  @ApiResponse({ status: 200, description: '중복 확인 결과' })
  @Get('check-id')
  async checkId(@Query('loginId') loginId: string) {
    return await this.authService.checkIdExists(loginId);
  }

  /**
   * 액세스 토큰 갱신 API
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
   * @param refreshTokenDto 리프레시 토큰 정보
   * @returns 새로운 액세스 토큰과 사용자 정보
   */
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  /**
   * 로그아웃 API
   * 리프레시 토큰을 삭제하여 로그아웃을 처리합니다.
   * @param refreshTokenDto 리프레시 토큰 정보
   * @returns 로그아웃 성공 메시지
   */
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refresh_token);
    return { message: '로그아웃되었습니다.' };
  }
}

