import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: '리프레시 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '리프레시 토큰을 입력해주세요.' })
  refresh_token: string;
}

