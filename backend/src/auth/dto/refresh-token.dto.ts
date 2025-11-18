/**
 * 리프레시 토큰 DTO (Data Transfer Object)
 * 액세스 토큰 갱신 시 클라이언트로부터 받는 리프레시 토큰의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 리프레시 토큰이 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 리프레시 토큰 데이터의 구조를 명확히 정의
 * - 보안: 빈 토큰이나 잘못된 형식의 토큰을 방지
 * - 자동 변환: ValidationPipe가 자동으로 검증 및 변환 수행
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  // 리프레시 토큰 필드
  // 왜 검증이 필요한가? 빈 토큰을 방지하여 유효한 토큰만 서버에 전달되도록 함
  @IsString({ message: '리프레시 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '리프레시 토큰을 입력해주세요.' })
  refresh_token: string;
}

