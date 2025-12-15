import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  @MinLength(3, { message: '아이디는 최소 3자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자까지 가능합니다.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: '아이디는 영문자와 숫자만 사용할 수 있습니다.',
  })
  loginId: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다.' })
  @MaxLength(100, { message: '비밀번호는 최대 100자까지 가능합니다.' })
  @Matches(/^[^\u3131-\uD79D]+$/, {
    message: '비밀번호에 한글을 포함할 수 없습니다.',
  })
  password: string;

  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MinLength(1, { message: '이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자까지 가능합니다.' })
  @Matches(/^[가-힣a-zA-Z]+$/, {
    message: '이름은 한글 또는 영문자만 사용할 수 있습니다.',
  })
  name: string;

}

