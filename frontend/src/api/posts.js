// src/api/posts.js

const API_BASE = "http://localhost:3000";
const ENDPOINT = "post";

// ------------------ 공통 함수 ------------------
export async function apiGet(endpoint, id = "") {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`);
  if (!res.ok) throw new Error("GET 요청 실패");
  return await res.json();
}

export async function apiPost(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("POST 실패");
  return await res.json();
}

export async function apiPut(endpoint, id, data) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PUT 실패");
  return await res.json();
}

export async function apiPatch(endpoint, id, data) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PATCH 실패");
  return await res.json();
}

export async function apiDelete(endpoint, id) {
  const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("DELETE 실패");
  return true;
}

// ------------------ posts용 wrapper 함수 ------------------
export const getPosts = () => apiGet(ENDPOINT);
export const getPostById = (id) => apiGet(ENDPOINT, id);
export const createPost = (data) => apiPost(ENDPOINT, data);
export const updatePost = (id, data) => apiPut(ENDPOINT, id, data);
export const patchPost = (id, data) => apiPatch(ENDPOINT, id, data);
export const deletePost = (id) => apiDelete(ENDPOINT, id);
