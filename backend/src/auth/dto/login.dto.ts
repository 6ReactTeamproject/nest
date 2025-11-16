/**
 * 로그인 DTO (Data Transfer Object)
 * 로그인 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 로그인 정보가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 로그인 데이터의 구조를 명확히 정의
 * - 보안: 최소 길이 검증으로 약한 비밀번호 방지
 * - 자동 변환: ValidationPipe가 자동으로 검증 및 변환 수행
 */

import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  // 로그인 ID 필드
  // 왜 검증이 필요한가? 빈 아이디를 방지하여 불필요한 서버 요청 차단
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  loginId: string;

  // 비밀번호 필드
  // 왜 검증이 필요한가? 빈 비밀번호나 너무 짧은 비밀번호를 방지하여 보안 강화
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다.' })
  // 왜 최소 4자인가? 너무 짧은 비밀번호는 보안상 위험하므로
  password: string;
}

