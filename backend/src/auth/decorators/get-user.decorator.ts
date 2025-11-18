/**
 * 사용자 정보 추출 데코레이터
 * JWT 인증 후 요청 객체에 저장된 사용자 정보를 쉽게 추출할 수 있도록 하는 커스텀 파라미터 데코레이터입니다.
 * 
 * 왜 필요한가?
 * - 편리한 사용: 컨트롤러에서 @GetUser() 데코레이터로 쉽게 사용자 정보 추출
 * - 코드 간결성: request.user를 직접 접근하는 것보다 깔끔하고 명확함
 * - 타입 안전성: JwtPayload 타입으로 반환하여 타입 안전성 보장
 * - 재사용성: 여러 컨트롤러에서 동일한 방식으로 사용자 정보 접근
 * 
 * 사용법: 컨트롤러 메서드 파라미터에 @GetUser() user: { userId: number; loginId: string }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * 사용자 정보를 추출하는 커스텀 파라미터 데코레이터
 * 
 * 왜 createParamDecorator를 사용하나? NestJS에서 커스텀 파라미터 데코레이터를 만들기 위해
 * 
 * @param data 데코레이터에 전달된 데이터 (현재 사용하지 않음)
 * @param ctx 실행 컨텍스트: HTTP 요청/응답 객체에 접근하기 위해
 * @returns JWT에서 추출한 사용자 정보 (userId, loginId 등)
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    // HTTP 요청 객체 가져오기
    // switchToHttp: NestJS의 실행 컨텍스트를 HTTP 컨텍스트로 변환
    // 왜 필요한가? HTTP 요청 객체에 접근하기 위해
    const request = ctx.switchToHttp().getRequest();
    // JWT 인증 미들웨어(JwtStrategy)에서 설정한 사용자 정보 반환
    // request.user: JwtStrategy의 validate 메서드에서 반환한 값이 저장됨
    // 왜 이렇게 하나? JWT 토큰 검증 후 사용자 정보를 요청 객체에 저장하여 재사용
    return request.user;
  },
);

