import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateMemberDto {
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MinLength(1, { message: '이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 가능합니다.' })
  name: string;

  @IsString({ message: '소개는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '소개를 입력해주세요.' })
  @MinLength(1, { message: '소개는 최소 1자 이상이어야 합니다.' })
  introduction: string;

  @IsOptional()
  @IsString({ message: '이미지는 문자열이어야 합니다.' })
  imageUrl?: string;
}
