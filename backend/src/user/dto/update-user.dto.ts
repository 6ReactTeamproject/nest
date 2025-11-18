/**
 * 사용자 정보 수정 DTO (Data Transfer Object)
 * 사용자 정보 수정 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 수정 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 수정 데이터의 구조를 명확히 정의
 * - 선택적 필드: PartialType을 사용하여 모든 필드를 선택적으로 만듦
 * - 비밀번호 변경: currentPassword 필드를 추가하여 비밀번호 변경 시 현재 비밀번호 검증
 * 
 * 주의: 비밀번호 변경 시 currentPassword 필드가 필수입니다.
 */

import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

// PartialType: CreateUserDto의 모든 필드를 선택적으로 만듦
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // 현재 비밀번호 필드 (비밀번호 변경 시 필수)
  // 왜 선택적인가? 비밀번호를 변경하지 않을 수도 있으므로
  // 왜 필요한가? 비밀번호 변경 시 현재 비밀번호를 확인하여 보안 강화
  @IsOptional()
  @IsString({ message: '현재 비밀번호는 문자열이어야 합니다.' })
  @MinLength(4, { message: '현재 비밀번호는 최소 4자 이상이어야 합니다.' })
  currentPassword?: string;
}
