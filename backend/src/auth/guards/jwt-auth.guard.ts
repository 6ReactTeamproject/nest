/**
 * JWT 인증 가드
 * Passport의 JWT 전략을 사용하여 요청의 JWT 토큰을 검증합니다.
 * 
 * 왜 필요한가?
 * - 인증 보호: 이 가드를 사용하는 엔드포인트는 인증된 사용자만 접근 가능
 * - 자동 검증: JWT 토큰을 자동으로 검증하고 유효하지 않으면 요청 거부
 * - Passport 통합: NestJS의 Passport 모듈과 통합하여 인증 처리
 * - 재사용성: 여러 컨트롤러에서 @UseGuards(JwtAuthGuard)로 쉽게 사용 가능
 * 
 * 사용법: 컨트롤러 메서드에 @UseGuards(JwtAuthGuard) 데코레이터 추가
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt'): Passport의 'jwt' 전략을 사용하는 가드
// 왜 'jwt'인가? JwtStrategy에서 'jwt'라는 이름으로 등록했으므로
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

