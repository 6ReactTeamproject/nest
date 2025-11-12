const API_BASE = "http://localhost:3000";
// fetch 적용 각자하고고
// GET: 리스트 전체 or 하나
export async function apiGet(endpoint, id = "") {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`);
  if (!res.ok) throw new Error("GET 요청 실패");
  return await res.json();
}

// GET (쿼리형) – 로그인용 등
export async function apiQuery(endpoint, queryObj) {
  const query = new URLSearchParams(queryObj).toString();
  const res = await fetch(`${API_BASE}/${endpoint}?${query}`);
  if (!res.ok) throw new Error("쿼리 GET 실패");
  return await res.json();
}

// POST: 데이터 생성
export async function apiPost(endpoint, data, onSuccess) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("POST 실패");

  const result = await res.json();

  if (onSuccess) onSuccess();
  return result;
}

// PUT: 전체 수정
export async function apiPut(endpoint, id, data) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PUT 실패");
  return await res.json();
}

// PATCH: 일부 수정
export async function apiPatch(endpoint, id, data) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PATCH 실패");
  return await res.json();
}

// DELETE: 삭제
export async function apiDelete(endpoint, id) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("DELETE 실패");
  return true;
}
