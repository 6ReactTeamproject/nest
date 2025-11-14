// ID 비교 유틸 함수
export const compareIds = (id1, id2) => {
  return String(id1) === String(id2);
};

// 사용자 찾기 유틸 함수
export const findUserById = (users, userId) => {
  return users.find((u) => compareIds(u.id, userId));
};

// 날짜 포맷팅 유틸 함수
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR");
};

// 날짜만 포맷팅
export const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

