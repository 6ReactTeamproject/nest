// 현재 페이지에 표시할 항목들을 반환하는 함수
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  // 마지막 항목의 인덱스
  const indexOfLastItem = currentPage * itemsPerPage;
  // 첫 번째 항목의 인덱스
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 해당 페이지에 표시할 항목들만 잘라서 반환
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

// 전체 페이지 수를 계산하는 함수
export const getTotalPages = (totalItems, itemsPerPage) => {
  // 전체 항목 수를 페이지당 항목 수로 나눈 뒤 올림하여 총 페이지 수 반환
  return Math.ceil(totalItems.length / itemsPerPage);
};
