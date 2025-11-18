/**
 * 페이지네이션 유틸리티 모듈
 * 페이지네이션에 필요한 함수들을 제공합니다.
 * 
 * 왜 필요한가?
 * - 대량의 데이터를 페이지 단위로 나누어 표시
 * - 사용자 경험 향상: 한 번에 너무 많은 데이터를 보여주지 않음
 * - 성능 최적화: 필요한 데이터만 렌더링
 */

/**
 * 현재 페이지에 표시할 항목들을 반환하는 함수
 * 
 * 왜 필요한가?
 * - 전체 항목 중 현재 페이지에 해당하는 항목만 추출
 * - slice를 사용하여 배열의 일부만 반환
 * 
 * @param {Array} items - 전체 항목 배열
 * @param {number} currentPage - 현재 페이지 번호 (1부터 시작)
 * @param {number} itemsPerPage - 페이지당 항목 수
 * @returns {Array} 현재 페이지에 표시할 항목 배열
 */
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  // 마지막 항목의 인덱스
  // 예: 2페이지, 5개씩 -> 2 * 5 = 10 (인덱스는 0부터 시작하므로 10은 포함 안 됨)
  const indexOfLastItem = currentPage * itemsPerPage;
  // 첫 번째 항목의 인덱스
  // 예: 2페이지, 5개씩 -> 10 - 5 = 5 (인덱스 5부터 시작)
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 해당 페이지에 표시할 항목들만 잘라서 반환
  // slice: 배열의 일부를 추출 (원본 배열은 변경하지 않음)
  // 왜 slice를 사용하나? 원본 배열을 변경하지 않고 새로운 배열을 반환
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

/**
 * 전체 페이지 수를 계산하는 함수
 * 
 * 왜 필요한가?
 * - 페이지네이션 UI에서 총 페이지 수를 표시하기 위해
 * - Math.ceil을 사용하여 올림 처리 (나머지가 있어도 페이지 필요)
 * 
 * @param {Array} totalItems - 전체 항목 배열
 * @param {number} itemsPerPage - 페이지당 항목 수
 * @returns {number} 전체 페이지 수
 */
export const getTotalPages = (totalItems, itemsPerPage) => {
  // 전체 항목 수를 페이지당 항목 수로 나눈 뒤 올림하여 총 페이지 수 반환
  // Math.ceil: 올림 함수
  // 왜 올림하나? 나머지가 있어도 한 페이지가 더 필요하므로
  // 예: 23개 항목, 5개씩 -> 23 / 5 = 4.6 -> 올림 -> 5페이지
  return Math.ceil(totalItems.length / itemsPerPage);
};
