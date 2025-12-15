

import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {

  @IsOptional()
  @IsBoolean({ message: '읽음 여부는 boolean 값이어야 합니다.' })
  isRead?: boolean;
}

