import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
  @MinLength(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
  text: string;

  @IsNumber({}, { message: '게시글 ID는 숫자여야 합니다.' })
  @IsInt({ message: '게시글 ID는 정수여야 합니다.' })
  @Min(1, { message: '게시글 ID는 1 이상이어야 합니다.' })
  postId: number;
}
