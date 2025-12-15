export const compareIds = (id1, id2) => {
  return String(id1) === String(id2);
};

export const findUserById = (users, userId) => {
  return users.find((u) => compareIds(u.id, userId));
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR");
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

