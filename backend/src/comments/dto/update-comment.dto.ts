/**
 * 댓글 수정 DTO (Data Transfer Object)
 * 댓글 수정 시 클라이언트로부터 받는 데이터의 구조와 유효성을 정의합니다.
 * 
 * 왜 필요한가?
 * - 데이터 검증: 잘못된 수정 데이터가 서버에 전달되는 것을 방지
 * - 타입 안전성: TypeScript로 수정 데이터의 구조를 명확히 정의
 * - 선택적 필드: PartialType을 사용하여 모든 필드를 선택적으로 만듦
 * - 코드 재사용: CreateCommentDto의 검증 규칙을 재사용하여 중복 제거
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';

// PartialType: CreateCommentDto의 모든 필드를 선택적으로 만듦
// 왜 PartialType을 사용하나? 수정 시 모든 필드를 필수로 하지 않고 필요한 필드만 수정할 수 있게 하기 위해
export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
