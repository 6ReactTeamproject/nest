export const filterPosts = (posts, keyword, searchType, users = []) => {
  // 검색어가 비어있으면 모든 게시글 반환
  if (!keyword.trim()) return posts;

  // 게시글 배열을 조건에 따라 필터링
  return posts.filter((post) => {
    // 게시글 제목과 내용을 소문자로 변환하여 비교 (대소문자 구분 없이 검색)
    const title =
      typeof post.title === "string" ? post.title.toLowerCase() : "";
    const content =
      typeof post.content === "string" ? post.content.toLowerCase() : "";
    const userId = post.userId?.toString(); // 사용자 ID를 문자열로 변환

    // 작성자 정보 찾기 (사용자 ID로 해당 사용자 정보 조회)
    const author = users.find((user) => user.id.toString() === userId);
    const authorName = author?.name?.toLowerCase() || ""; // 작성자 이름을 소문자로 변환

    // 검색 조건에 따라 필터링 분기
    switch (searchType) {
      case "title": // 제목에서 검색어 포함 여부
        return title.includes(keyword);
      case "content": // 내용에서 검색어 포함 여부
        return content.includes(keyword);
      case "title_content": // 제목 또는 내용에 포함되어 있으면 통과
        return title.includes(keyword) || content.includes(keyword);
      case "author": // 작성자 이름에 포함되어 있으면 통과
        return authorName.includes(keyword);
      case "userId": // 사용자 ID와 정확히 일치해야 통과
        return userId === keyword;
      default:
        return false; // 검색 조건이 명확하지 않으면 포함되지 않음
    }
  });
};
