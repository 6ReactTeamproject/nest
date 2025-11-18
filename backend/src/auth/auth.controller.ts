/**
 * 인증 관련 컨트롤러
 * 회원가입, 로그인, 로그아웃, 토큰 갱신 등의 인증 관련 API 엔드포인트를 제공합니다.
 * 
 * 왜 필요한가?
 * - API 엔드포인트 제공: 인증 관련 HTTP 요청을 처리하는 진입점
 * - 인증 처리: 사용자 인증, 토큰 발급, 토큰 갱신 등의 기능 제공
 * - Swagger 문서화: API 문서 자동 생성으로 개발자 편의성 향상
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

// @ApiTags: Swagger 문서에서 이 컨트롤러를 '인증' 그룹으로 분류
// 왜 필요한가? API 문서에서 관련 엔드포인트를 그룹화하여 찾기 쉽게 함
@ApiTags('인증')
// @Controller: '/auth' 경로로 시작하는 요청을 처리
// 왜 필요한가? 인증 관련 요청을 한 곳에서 관리하기 위해
@Controller('auth')
export class AuthController {
  // AuthService 주입: 인증 관련 비즈니스 로직 처리
  // 왜 주입하나? 의존성 주입을 통해 테스트 가능하고 유연한 코드 작성
  constructor(private authService: AuthService) {}

  /**
   * 회원가입 API
   * 새로운 사용자를 등록하고 JWT 토큰을 발급합니다.
   * 
   * 왜 필요한가?
   * - 사용자 등록: 새로운 사용자를 시스템에 등록
   * - 자동 로그인: 회원가입 후 즉시 로그인 상태로 전환하여 사용자 경험 향상
   * - 토큰 발급: 회원가입과 동시에 인증 토큰 발급
   * 
   * @param registerDto 회원가입 정보 (아이디, 비밀번호, 이름 등)
   * @returns 액세스 토큰, 리프레시 토큰, 사용자 정보
   */
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 아이디' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // AuthService의 register 메서드 호출
    // 왜 서비스에 위임하나? 비즈니스 로직은 서비스에서 처리하므로
    return await this.authService.register(registerDto);
  }

  /**
   * 로그인 API
   * 사용자 인증 후 JWT 토큰을 발급합니다.
   * 
   * 왜 필요한가?
   * - 사용자 인증: 아이디와 비밀번호로 사용자 확인
   * - 토큰 발급: 인증 성공 시 JWT 토큰 발급
   * - 세션 관리: 토큰을 통해 사용자 세션 관리
   * 
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
   * 
   * 왜 필요한가?
   * - 중복 방지: 회원가입 전 아이디 중복 여부를 미리 확인
   * - 사용자 경험: 회원가입 폼에서 실시간으로 중복 확인 가능
   * - 데이터 무결성: 중복된 아이디로 회원가입 시도 방지
   * 
   * @param loginId 확인할 아이디 (쿼리 파라미터)
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
   * 
   * 왜 필요한가?
   * - 토큰 갱신: 액세스 토큰 만료 시 자동으로 새 토큰 발급
   * - 사용자 경험: 사용자가 다시 로그인할 필요 없이 계속 사용 가능
   * - 보안: 짧은 액세스 토큰 수명으로 보안 강화
   * 
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
   * 
   * 왜 필요한가?
   * - 세션 종료: 사용자 로그아웃 시 토큰 무효화
   * - 보안: 로그아웃 후 토큰이 사용되지 않도록 보장
   * - 정리: 서버에서 리프레시 토큰 삭제
   * 
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

