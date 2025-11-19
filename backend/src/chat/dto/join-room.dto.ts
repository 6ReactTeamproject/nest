/**
 * 방 입장 DTO
 * 방 입장 시 필요한 데이터를 검증합니다.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @IsString({ message: '방 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '방 ID를 입력해주세요.' })
  roomId: string;
}

