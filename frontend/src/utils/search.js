/**
 * 게시글 검색 필터링 함수
 * 키워드와 검색 타입에 따라 게시글을 필터링합니다.
 * 
 * 왜 필요한가?
 * - 게시글 검색 기능: 사용자가 원하는 게시글을 빠르게 찾을 수 있게 함
 * - 다양한 검색 옵션: 제목, 내용, 작성자 등 다양한 조건으로 검색 가능
 * - 대소문자 구분 없이 검색: 사용자 경험 향상
 * 
 * @param {Array} posts - 검색할 게시글 배열
 * @param {string} keyword - 검색 키워드
 * @param {string} searchType - 검색 타입 ('title', 'content', 'title_content', 'author', 'userId')
 * @param {Array} users - 사용자 배열 (작성자 검색용)
 * @returns {Array} 필터링된 게시글 배열
 */
export const filterPosts = (posts, keyword, searchType, users = []) => {
  // 검색어가 비어있으면 모든 게시글 반환
  // 왜 필요한가? 검색어가 없으면 필터링할 필요가 없으므로 성능 최적화
  if (!keyword.trim()) return posts;

  // 게시글 배열을 조건에 따라 필터링
  // filter: 조건에 맞는 게시글만 남김
  return posts.filter((post) => {
    // 게시글 제목과 내용을 소문자로 변환하여 비교 (대소문자 구분 없이 검색)
    // 왜 소문자로 변환하나? 대소문자 구분 없이 검색하여 사용자 경험 향상
    const title =
      typeof post.title === "string" ? post.title.toLowerCase() : "";
    const content =
      typeof post.content === "string" ? post.content.toLowerCase() : "";
    const userId = post.userId?.toString(); // 사용자 ID를 문자열로 변환
    // 왜 문자열로 변환하나? 숫자와 문자열 비교를 일관되게 하기 위해

    // 작성자 정보 찾기 (사용자 ID로 해당 사용자 정보 조회)
    // find: 배열에서 조건에 맞는 첫 번째 요소 반환
    const author = users.find((user) => user.id.toString() === userId);
    const authorName = author?.name?.toLowerCase() || ""; // 작성자 이름을 소문자로 변환
    // 옵셔널 체이닝(?.)과 null 병합 연산자(||): 안전하게 값 추출

    // 검색 조건에 따라 필터링 분기
    switch (searchType) {
      case "title": // 제목에서 검색어 포함 여부
        // includes: 문자열에 특정 문자열이 포함되어 있는지 확인
        return title.includes(keyword);
      case "content": // 내용에서 검색어 포함 여부
        return content.includes(keyword);
      case "title_content": // 제목 또는 내용에 포함되어 있으면 통과
        // || 연산자: 둘 중 하나라도 true이면 true
        return title.includes(keyword) || content.includes(keyword);
      case "author": // 작성자 이름에 포함되어 있으면 통과
        return authorName.includes(keyword);
      case "userId": // 사용자 ID와 정확히 일치해야 통과
        // === 연산자: 정확히 일치해야 함
        return userId === keyword;
      default:
        // 검색 조건이 명확하지 않으면 포함되지 않음
        // 왜 false를 반환하나? 예상치 못한 검색 타입에 대해 안전하게 처리
        return false;
    }
  });
};
