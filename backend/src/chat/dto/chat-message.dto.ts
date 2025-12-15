

import { IsString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @IsString({ message: '방 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '방 ID를 입력해주세요.' })
  roomId: string;

  @IsString({ message: '메시지는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  message: string;
}

