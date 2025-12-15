import { API_BASE_URL } from "../constants";

const API_BASE = API_BASE_URL;

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
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

async function handleErrorResponse(res, originalRequest = null) {
  let errorData;
  try {
    errorData = await res.json();
  } catch {
    if (res.status === 401) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }
    if (res.status === 403) {
      throw new Error("권한이 없습니다.");
    }
    throw new Error("요청 실패");
  }

  if (res.status === 401) {
    console.error("401 오류:", errorData);
    
    if (errorData.message?.includes("expired") || errorData.message?.includes("invalid") || errorData.message?.includes("Unauthorized")) {
      try {
        const newAccessToken = await refreshAccessToken();
        
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
        
        throw new Error("토큰이 갱신되었습니다. 다시 시도해주세요.");
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        throw new Error(refreshError.message || "토큰이 만료되었습니다. 다시 로그인해주세요.");
      }
    }
    
    throw new Error(errorData.message || "인증이 필요합니다. 로그인해주세요.");
  }
  if (res.status === 403) {
    console.error("403 오류:", errorData);
    throw new Error(errorData.message || "권한이 없습니다.");
  }
  throw new Error(errorData.message || "요청 실패");
}

export async function apiGet(endpoint, idOrQuery = "") {
  let url = `${API_BASE}/${endpoint}`;
  if (idOrQuery && idOrQuery.startsWith("?")) {
    url += idOrQuery;
  } else if (idOrQuery) {
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

export async function apiPost(endpoint, data, onSuccess) {
  const headers = getHeaders();
  
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
    throw new Error("요청에 실패했습니다.");
  }

  const result = await res.json();

  if (onSuccess) onSuccess();
  return result;
}

export async function apiPatch(endpoint, id, data) {
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

export async function apiUploadImage(base64Image) {
  const response = await fetch(base64Image);
  const blob = await response.blob();
  
  const formData = new FormData();
  formData.append('file', blob, 'image.jpg');
  
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  
  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const result = await handleErrorResponse(res, {
      method: "POST",
      url: `${API_BASE}/upload/image`,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (result !== undefined) return result.path;
    throw new Error("이미지 업로드에 실패했습니다.");
  }
  
  const data = await res.json();
  return data.path;
}
