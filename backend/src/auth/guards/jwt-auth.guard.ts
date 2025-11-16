/**
 * JWT 인증 가드
 * Passport의 JWT 전략을 사용하여 요청의 JWT 토큰을 검증합니다.
 * 이 가드를 사용하는 엔드포인트는 인증된 사용자만 접근할 수 있습니다.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

