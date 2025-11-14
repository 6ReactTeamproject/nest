import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateSemesterDto {
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 가능합니다.' })
  title: string;

  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '설명을 입력해주세요.' })
  @MinLength(1, { message: '설명은 최소 1자 이상이어야 합니다.' })
  description: string;

  @IsOptional()
  @IsString({ message: '이미지는 문자열이어야 합니다.' })
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  imageUrl?: string;
}

