/**
 * 댓글 생성 DTO (Data Transfer Object)
 * 댓글 작성 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 댓글 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 댓글 데이터의 구조를 명확히 정의
 * - 보안: 클라이언트가 보내면 안 되는 필드(userId 등)를 제외
 * - 자동 변환: ValidationPipe가 자동으로 검증 및 변환 수행
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  // 댓글 내용 필드
  // 왜 검증이 필요한가? 빈 댓글을 방지하여 의미 있는 댓글만 작성되도록 함
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
  @MinLength(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
  text: string;

  // 게시글 ID 필드
  // 왜 검증이 필요한가? 유효한 게시글 ID인지 확인하여 잘못된 댓글 작성 방지
  @IsNumber({}, { message: '게시글 ID는 숫자여야 합니다.' })
  @IsInt({ message: '게시글 ID는 정수여야 합니다.' })
  // Min(1): ID는 1 이상이어야 함 (0이나 음수는 유효하지 않음)
  // 왜 1 이상인가? 데이터베이스의 기본 키는 1부터 시작하므로
  @Min(1, { message: '게시글 ID는 1 이상이어야 합니다.' })
  postId: number;
}
