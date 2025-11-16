/**
 * JWT 인증 전략
 * Passport의 JWT 전략을 사용하여 JWT 토큰을 검증하고 사용자 정보를 추출합니다.
 * 
 * 왜 필요한가?
 * - JWT 토큰 검증: 요청의 JWT 토큰이 유효한지 확인
 * - 사용자 정보 추출: 토큰에서 사용자 정보를 추출하여 요청 객체에 저장
 * - Passport 통합: NestJS의 Passport 모듈과 통합하여 인증 처리
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // super: 부모 클래스(PassportStrategy)의 생성자 호출
    // JWT 전략 설정
    super({
      // jwtFromRequest: 요청에서 JWT 토큰을 추출하는 방법
      // fromAuthHeaderAsBearerToken: Authorization 헤더의 Bearer 토큰에서 추출
      // 왜 Bearer 토큰인가? JWT는 일반적으로 Bearer 토큰 형식으로 전송됨
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: 토큰 만료 무시 여부
      // false: 만료된 토큰은 거부 (보안상 중요)
      ignoreExpiration: false,
      // secretOrKey: JWT 토큰을 검증할 때 사용하는 시크릿 키
      // ConfigService: 환경 변수에서 시크릿 키 가져오기
      // 왜 환경 변수를 사용하나? 프로덕션에서는 안전한 시크릿 키를 사용해야 하므로
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  /**
   * JWT 페이로드 검증
   * 토큰에서 추출한 페이로드를 검증하고 사용자 정보를 반환합니다.
   * 
   * 왜 필요한가?
   * - 토큰이 유효하면 페이로드에서 사용자 정보 추출
   * - 반환된 값은 request.user에 저장되어 컨트롤러에서 사용 가능
   * 
   * @param payload JWT 토큰에서 추출한 페이로드
   * @returns 사용자 정보 (userId, loginId)
   */
  async validate(payload: JwtPayload): Promise<{ userId: number; loginId: string }> {
    // 페이로드에서 사용자 정보 추출
    // 왜 이 정보만 반환하나? 보안상 최소한의 정보만 포함 (민감한 정보는 제외)
    return { userId: payload.userId, loginId: payload.loginId };
  }
}

