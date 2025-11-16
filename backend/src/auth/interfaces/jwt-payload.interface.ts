/**
 * JWT 페이로드 인터페이스
 * JWT 토큰에 포함될 사용자 정보를 정의합니다.
 * 
 * 왜 필요한가?
 * - 타입 안전성: TypeScript에서 JWT 페이로드의 구조를 명확히 정의
 * - 일관성: 모든 JWT 관련 코드에서 동일한 구조 사용
 * - 최소한의 정보만 포함: 보안상 필요한 정보만 토큰에 포함
 */
export interface JwtPayload {
  userId: number; // 사용자 ID
  loginId: string; // 사용자 로그인 ID
}

