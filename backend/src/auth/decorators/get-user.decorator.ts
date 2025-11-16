/**
 * 사용자 정보 추출 데코레이터
 * JWT 인증 후 요청 객체에 저장된 사용자 정보를 쉽게 추출할 수 있도록 하는 커스텀 파라미터 데코레이터입니다.
 * 컨트롤러 메서드의 파라미터에 @GetUser()를 사용하여 현재 로그인한 사용자 정보를 받을 수 있습니다.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * 사용자 정보를 추출하는 커스텀 파라미터 데코레이터
 * @param data 데코레이터에 전달된 데이터 (현재 사용하지 않음)
 * @param ctx 실행 컨텍스트
 * @returns JWT에서 추출한 사용자 정보 (userId, loginId 등)
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    // HTTP 요청 객체 가져오기
    const request = ctx.switchToHttp().getRequest();
    // JWT 인증 미들웨어에서 설정한 사용자 정보 반환
    return request.user;
  },
);

