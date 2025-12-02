/**
 * 쪽지 수정 DTO (Data Transfer Object)
 * 쪽지 수정 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 수정 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 수정 데이터의 구조를 명확히 정의
 * - 선택적 필드: PartialType을 사용하여 모든 필드를 선택적으로 만듦
 * - 코드 재사용: CreateMessageDto의 검증 규칙을 재사용하여 중복 제거
 * 
 * 주의: 주로 읽음 처리(isRead)에 사용됩니다.
 */

import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

// PartialType: CreateMessageDto의 모든 필드를 선택적으로 만듦
// 왜 PartialType을 사용하나? 수정 시 모든 필드를 필수로 하지 않고 필요한 필드만 수정할 수 있게 하기 위해
export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  // 읽음 여부 필드
  // 왜 필요한가? 쪽지를 읽었는지 표시하기 위해
  @IsOptional()
  @IsBoolean({ message: '읽음 여부는 boolean 값이어야 합니다.' })
  isRead?: boolean;
}

