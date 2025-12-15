

import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsString({ message: '현재 비밀번호는 문자열이어야 합니다.' })
  @MinLength(4, { message: '현재 비밀번호는 최소 4자 이상이어야 합니다.' })
  currentPassword?: string;
}
