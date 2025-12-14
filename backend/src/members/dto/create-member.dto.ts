/**
 * 멤버 소개 생성 DTO (Data Transfer Object)
 * 멤버 소개 작성 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 멤버 소개 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 멤버 소개 데이터의 구조를 명확히 정의
 * - 보안: 클라이언트가 보내면 안 되는 필드(userId 등)를 제외
 * - 자동 변환: ValidationPipe가 자동으로 검증 및 변환 수행
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateMemberDto {
  // 멤버 이름 필드
  // 왜 검증이 필요한가? 빈 이름이나 너무 긴 이름을 방지하여 데이터 무결성 보장
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MinLength(1, { message: '이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 가능합니다.' })
  name: string;

  // 멤버 소개 내용 필드
  // 왜 검증이 필요한가? 빈 소개를 방지하여 의미 있는 멤버 소개만 작성되도록 함
  @IsString({ message: '소개는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '소개를 입력해주세요.' })
  @MinLength(1, { message: '소개는 최소 1자 이상이어야 합니다.' })
  introduction: string;

  // 멤버 이미지 URL 또는 경로 필드 (선택적)
  // 왜 선택적인가? 이미지가 없는 멤버 소개도 작성할 수 있어야 하므로
  // 외부 URL (예: https://example.com/image.jpg) 또는 로컬 경로 (예: /uploads/uuid-filename.jpg) 모두 허용
  // 왜 URL 검증을 선택적으로 하나? 로컬 경로(/uploads/...)도 허용해야 하므로
  @IsOptional()
  @IsString({ message: '이미지는 문자열이어야 합니다.' })
  imageUrl?: string;
}
