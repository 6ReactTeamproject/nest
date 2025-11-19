/**
 * 채팅 메시지 DTO
 * 채팅 메시지 전송 시 필요한 데이터를 검증합니다.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @IsString({ message: '방 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '방 ID를 입력해주세요.' })
  roomId: string;

  @IsString({ message: '메시지는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  message: string;
}

