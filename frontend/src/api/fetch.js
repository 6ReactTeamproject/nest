import { API_BASE_URL } from "../constants";

const API_BASE = API_BASE_URL;

// 리프레시 토큰으로 액세스 토큰 갱신
let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  // 이미 갱신 중이면 기존 Promise 반환
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        throw new Error("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data.access_token;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// JWT 토큰을 헤더에 포함하는 헤더 생성 함수
export function getHeaders() {
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("JWT 토큰이 없습니다. 로그인이 필요할 수 있습니다.");
  }
  return headers;
}

// 공통 에러 처리 함수
async function handleErrorResponse(res, originalRequest = null) {
  let errorData;
  try {
    errorData = await res.json();
  } catch {
    // JSON 파싱 실패 시 기본 에러 메시지
    if (res.status === 401) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }
    if (res.status === 403) {
      throw new Error("권한이 없습니다.");
    }
    throw new Error("요청 실패");
  }

  // 401 오류인 경우 - 리프레시 토큰으로 재시도
  if (res.status === 401) {
    console.error("401 오류:", errorData);
    
    // 토큰 만료인 경우 리프레시 토큰으로 재발급 시도
    if (errorData.message?.includes("expired") || errorData.message?.includes("invalid") || errorData.message?.includes("Unauthorized")) {
      try {
        const newAccessToken = await refreshAccessToken();
        
        // 원래 요청이 있으면 새 토큰으로 재시도
        if (originalRequest) {
          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };
          const retryRes = await fetch(originalRequest.url, retryConfig);
          if (!retryRes.ok) {
            return await handleErrorResponse(retryRes, retryConfig);
          }
          return await retryRes.json();
        }
        
        // 원래 요청이 없으면 에러만 던짐 (재시도 불가)
        throw new Error("토큰이 갱신되었습니다. 다시 시도해주세요.");
      } catch (refreshError) {
        // 리프레시 토큰 갱신 실패 시 로그아웃
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        throw new Error(refreshError.message || "토큰이 만료되었습니다. 다시 로그인해주세요.");
      }
    }
    
    throw new Error(errorData.message || "인증이 필요합니다. 로그인해주세요.");
  }
  // 403 오류인 경우
  if (res.status === 403) {
    console.error("403 오류:", errorData);
    throw new Error(errorData.message || "권한이 없습니다.");
  }
  // 기타 오류
  throw new Error(errorData.message || "요청 실패");
}

// GET: 리스트 전체 or 하나 (쿼리 파라미터 지원)
export async function apiGet(endpoint, idOrQuery = "") {
  let url = `${API_BASE}/${endpoint}`;
  // 쿼리 파라미터인 경우 (?로 시작)
  if (idOrQuery && idOrQuery.startsWith("?")) {
    url += idOrQuery;
  } else if (idOrQuery) {
    // ID인 경우
    url += `/${idOrQuery}`;
  }
  
  const requestConfig = {
    method: "GET",
    headers: getHeaders(),
  };
  
  const res = await fetch(url, requestConfig);
  if (!res.ok) {
    const result = await handleErrorResponse(res, { ...requestConfig, url });
    if (result !== undefined) return result;
    throw new Error("요청에 실패했습니다.");
  }
  return await res.json();
}

// POST: 데이터 생성
export async function apiPost(endpoint, data, onSuccess) {
  const headers = getHeaders();
  
  // 디버깅: 토큰이 있는지 확인
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("JWT 토큰이 없습니다. 다시 로그인해주세요.");
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  
  const requestConfig = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  };
  
  const res = await fetch(`${API_BASE}/${endpoint}`, requestConfig);

  if (!res.ok) {
    const result = await handleErrorResponse(res, { ...requestConfig, url: `${API_BASE}/${endpoint}` });
    if (result !== undefined) {
      if (onSuccess) onSuccess();
      return result;
    }
    // handleErrorResponse가 undefined를 반환한 경우 (에러를 던지지 않았지만 재시도도 안 됨)
    throw new Error("요청에 실패했습니다.");
  }

  // 성공 시에만 JSON 파싱
  const result = await res.json();

  if (onSuccess) onSuccess();
  return result;
}

// PATCH: 일부 수정
export async function apiPatch(endpoint, id, data) {
  // id에 이미 경로가 포함된 경우 (예: "1/view", "1/like") 처리
  const url = `${API_BASE}/${endpoint}/${id}`;
  const requestConfig = {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  };
  
  const res = await fetch(url, requestConfig);
  if (!res.ok) {
    const result = await handleErrorResponse(res, { ...requestConfig, url });
    if (result !== undefined) return result;
    throw new Error("요청에 실패했습니다.");
  }
  return await res.json();
}

// DELETE: 삭제
export async function apiDelete(endpoint, id) {
  const url = `${API_BASE}/${endpoint}/${id}`;
  const requestConfig = {
    method: "DELETE",
    headers: getHeaders(),
  };
  
  const res = await fetch(url, requestConfig);
  if (!res.ok) {
    const result = await handleErrorResponse(res, { ...requestConfig, url });
    if (result !== undefined) return true;
    throw new Error("요청에 실패했습니다.");
  }
  return true;
}
