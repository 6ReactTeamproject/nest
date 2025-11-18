/**
 * 공통 유틸리티 함수 모듈
 * ID 비교, 사용자 찾기, 날짜 포맷팅 등의 공통 함수를 제공합니다.
 * 
 * 왜 필요한가?
 * - 코드 재사용성: 여러 컴포넌트에서 사용하는 공통 로직을 한 곳에 모음
 * - 일관성: 동일한 방식으로 ID 비교, 날짜 포맷팅 등을 처리
 * - 유지보수성: 공통 로직을 한 곳에서 관리하여 수정이 용이
 */

/**
 * ID 비교 함수
 * 두 ID를 문자열로 변환하여 비교합니다.
 * 
 * 왜 필요한가?
 * - 타입 안전성: 숫자와 문자열 ID를 안전하게 비교
 * - 일관성: 모든 ID 비교를 동일한 방식으로 처리
 * 
 * @param {number|string} id1 - 첫 번째 ID
 * @param {number|string} id2 - 두 번째 ID
 * @returns {boolean} 두 ID가 같으면 true
 */
export const compareIds = (id1, id2) => {
  // String으로 변환: 숫자와 문자열을 일관되게 비교하기 위해
  return String(id1) === String(id2);
};

/**
 * 사용자 찾기 함수
 * 사용자 배열에서 특정 ID를 가진 사용자를 찾습니다.
 * 
 * 왜 필요한가?
 * - 작성자 정보: 게시글, 댓글 등의 작성자 정보를 찾기 위해
 * - 코드 재사용성: 여러 곳에서 사용하는 로직을 한 곳에 모음
 * 
 * @param {Array} users - 사용자 배열
 * @param {number|string} userId - 찾을 사용자 ID
 * @returns {Object|undefined} 찾은 사용자 객체 또는 undefined
 */
export const findUserById = (users, userId) => {
  // find: 배열에서 조건에 맞는 첫 번째 요소 반환
  // compareIds를 사용하여 안전하게 ID 비교
  return users.find((u) => compareIds(u.id, userId));
};

/**
 * 날짜 포맷팅 함수
 * 날짜 문자열을 한국어 형식으로 포맷팅합니다 (날짜 + 시간).
 * 
 * 왜 필요한가?
 * - 사용자 친화적 표시: 날짜를 사용자가 읽기 쉬운 형식으로 변환
 * - 일관성: 모든 날짜를 동일한 형식으로 표시
 * 
 * @param {string} dateString - 날짜 문자열 (ISO 형식 등)
 * @returns {string} 포맷팅된 날짜 문자열 (예: "2024. 1. 1. 오후 3:00:00")
 */
export const formatDate = (dateString) => {
  // 날짜 문자열이 없으면 빈 문자열 반환
  if (!dateString) return "";
  // Date 객체로 변환
  const date = new Date(dateString);
  // 한국어 형식으로 포맷팅 (날짜 + 시간)
  return date.toLocaleString("ko-KR");
};

/**
 * 날짜만 포맷팅 함수
 * 날짜 문자열을 한국어 형식으로 포맷팅합니다 (날짜만, 시간 제외).
 * 
 * 왜 필요한가?
 * - 날짜만 표시: 시간 정보가 필요 없을 때 사용
 * - 간결한 표시: 시간 없이 날짜만 표시하여 UI가 깔끔함
 * 
 * @param {string} dateString - 날짜 문자열 (ISO 형식 등)
 * @returns {string} 포맷팅된 날짜 문자열 (예: "2024. 1. 1.")
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // 한국어 형식으로 포맷팅 (날짜만)
  return date.toLocaleDateString("ko-KR");
};

