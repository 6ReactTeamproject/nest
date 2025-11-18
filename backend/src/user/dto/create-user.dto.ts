/**
 * 사용자 생성 DTO (Data Transfer Object)
 * 사용자 생성 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 사용자 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 사용자 데이터의 구조를 명확히 정의
 * - 보안: 정규식 검증으로 특수 문자, 한글 등 제한하여 보안 강화
 * - 자동 변환: ValidationPipe가 자동으로 검증 및 변환 수행
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  // 로그인 ID 필드
  // 왜 검증이 필요한가? 빈 아이디, 너무 짧거나 긴 아이디, 특수문자 포함 방지
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  @MinLength(3, { message: '아이디는 최소 3자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자까지 가능합니다.' })
  // 정규식: 영문자와 숫자만 허용
  // 왜 이렇게 제한하나? 특수문자로 인한 보안 문제 방지 및 일관성 유지
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: '아이디는 영문자와 숫자만 사용할 수 있습니다.',
  })
  loginId: string;

  // 비밀번호 필드
  // 왜 검증이 필요한가? 빈 비밀번호나 너무 짧은 비밀번호를 방지하여 보안 강화
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다.' })
  password: string;

  // 사용자 이름 필드
  // 왜 검증이 필요한가? 빈 이름, 너무 긴 이름, 특수문자 포함 방지
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MinLength(1, { message: '이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자까지 가능합니다.' })
  // 정규식: 한글 또는 영문자만 허용
  // 왜 이렇게 제한하나? 숫자나 특수문자로 인한 혼란 방지
  @Matches(/^[가-힣a-zA-Z]+$/, {
    message: '이름은 한글 또는 영문자만 사용할 수 있습니다.',
  })
  name: string;

  // 프로필 이미지 URL 필드 (선택적)
  // 왜 선택적인가? 이미지가 없는 사용자도 생성할 수 있어야 하므로
  // 왜 URL 검증이 필요한가? 잘못된 URL 형식을 방지하여 데이터베이스 오류 방지
  @IsOptional()
  @IsString({ message: '이미지는 문자열이어야 합니다.' })
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  image?: string;

  // Git URL 필드 (선택적)
  // 왜 선택적인가? Git URL이 없는 사용자도 생성할 수 있어야 하므로
  // 왜 URL 검증이 필요한가? 잘못된 URL 형식을 방지하여 데이터베이스 오류 방지
  @IsOptional()
  @IsString({ message: '깃허브 URL은 문자열이어야 합니다.' })
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  giturl?: string;
}
