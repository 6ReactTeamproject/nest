

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreateMessageDto {

  @IsNumber({}, { message: '수신자 ID는 숫자여야 합니다.' })
  @IsInt({ message: '수신자 ID는 정수여야 합니다.' })

  @Min(1, { message: '수신자 ID는 1 이상이어야 합니다.' })
  receiverId: number;

  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 가능합니다.' })
  title: string;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다.' })
  content: string;
}

