/**
 * API 통신 유틸리티 모듈
 * 백엔드 API와 통신하기 위한 공통 함수들을 제공합니다.
 * 
 * 왜 필요한가?
 * - 중앙화된 API 통신: 모든 API 호출을 한 곳에서 관리
 * - 자동 토큰 관리: JWT 토큰을 자동으로 헤더에 포함
 * - 자동 토큰 갱신: 토큰 만료 시 자동으로 리프레시 토큰으로 갱신
 * - 에러 처리: 공통 에러 처리 로직 제공
 * - 코드 재사용성: GET, POST, PATCH, DELETE 등 공통 함수 제공
 */

import { API_BASE_URL } from "../constants";

// API 기본 URL: 모든 API 요청의 기본 경로
const API_BASE = API_BASE_URL;

// 리프레시 토큰으로 액세스 토큰 갱신
// 중복 갱신 방지를 위한 플래그
// 왜 필요한가? 여러 요청이 동시에 401을 받으면 여러 번 갱신 요청을 보내는 것을 방지
let isRefreshing = false;
let refreshPromise = null;

/**
 * 액세스 토큰 갱신 함수
 * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
 * 
 * 왜 필요한가?
 * - 토큰 만료 처리: 액세스 토큰이 만료되면 자동으로 갱신
 * - 중복 방지: 여러 요청이 동시에 갱신을 시도하는 것을 방지
 * - 로그아웃 처리: 리프레시 토큰도 만료되면 자동 로그아웃
 */
async function refreshAccessToken() {
  // 이미 갱신 중이면 기존 Promise 반환
  // 왜 이렇게 하나? 여러 요청이 동시에 갱신을 시도하는 것을 방지하기 위해
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // localStorage에서 리프레시 토큰 가져오기
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      // 리프레시 토큰으로 새 액세스 토큰 요청
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        // 왜 로그아웃하나? 리프레시 토큰이 만료되면 다시 로그인해야 하므로
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        throw new Error("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
      }

      // 새 토큰 저장
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data.access_token;
    } finally {
      // 갱신 완료 후 플래그 초기화
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * JWT 토큰을 헤더에 포함하는 헤더 생성 함수
 * 
 * 왜 필요한가?
 * - 인증 헤더 자동 추가: 모든 API 요청에 JWT 토큰을 자동으로 포함
 * - 코드 중복 제거: 매번 헤더를 만드는 코드를 반복하지 않아도 됨
 * 
 * @returns {Object} HTTP 요청 헤더 객체
 */
export function getHeaders() {
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    // Bearer 토큰 형식으로 Authorization 헤더 추가
    // 왜 Bearer인가? JWT 토큰의 표준 인증 방식
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("JWT 토큰이 없습니다. 로그인이 필요할 수 있습니다.");
  }
  return headers;
}

/**
 * 공통 에러 처리 함수
 * HTTP 응답의 에러를 처리하고, 필요시 토큰 갱신 후 재시도합니다.
 * 
 * 왜 필요한가?
 * - 일관된 에러 처리: 모든 API 에러를 일관된 방식으로 처리
 * - 자동 토큰 갱신: 401 에러 시 자동으로 토큰 갱신 후 재시도
 * - 사용자 친화적 메시지: 에러를 사용자가 이해하기 쉬운 메시지로 변환
 * 
 * @param {Response} res - fetch 응답 객체
 * @param {Object|null} originalRequest - 원래 요청 정보 (재시도용)
 * @returns {Promise<any>} 성공 시 응답 데이터, 실패 시 에러 throw
 */
async function handleErrorResponse(res, originalRequest = null) {
  let errorData;
  try {
    errorData = await res.json();
  } catch {
    // JSON 파싱 실패 시 기본 에러 메시지
    // 왜 try-catch를 사용하나? 응답이 JSON이 아닐 수 있으므로
    if (res.status === 401) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }
    if (res.status === 403) {
      throw new Error("권한이 없습니다.");
    }
    throw new Error("요청 실패");
  }

  // 401 오류인 경우 - 리프레시 토큰으로 재시도
  // 왜 401을 특별히 처리하나? 토큰 만료 시 자동으로 갱신하여 사용자 경험 향상
  if (res.status === 401) {
    console.error("401 오류:", errorData);
    
    // 토큰 만료인 경우 리프레시 토큰으로 재발급 시도
    // 왜 메시지를 확인하나? 토큰 만료인지 다른 인증 오류인지 구분하기 위해
    if (errorData.message?.includes("expired") || errorData.message?.includes("invalid") || errorData.message?.includes("Unauthorized")) {
      try {
        const newAccessToken = await refreshAccessToken();
        
        // 원래 요청이 있으면 새 토큰으로 재시도
        // 왜 재시도하나? 사용자가 다시 요청을 보낼 필요 없이 자동으로 처리
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
        // 왜 로그아웃하나? 리프레시 토큰도 만료되면 다시 로그인해야 하므로
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        throw new Error(refreshError.message || "토큰이 만료되었습니다. 다시 로그인해주세요.");
      }
    }
    
    throw new Error(errorData.message || "인증이 필요합니다. 로그인해주세요.");
  }
  // 403 오류인 경우: 권한 없음
  if (res.status === 403) {
    console.error("403 오류:", errorData);
    throw new Error(errorData.message || "권한이 없습니다.");
  }
  // 기타 오류
  throw new Error(errorData.message || "요청 실패");
}

/**
 * GET 요청 함수
 * 서버에서 데이터를 가져옵니다.
 * 
 * 왜 필요한가?
 * - 데이터 조회: 게시글, 댓글, 사용자 정보 등을 가져올 때 사용
 * - 쿼리 파라미터 지원: 필터링, 정렬 등을 위한 쿼리 파라미터 지원
 * - ID 또는 쿼리 지원: 단일 항목 조회 또는 목록 조회 모두 지원
 * 
 * @param {string} endpoint - API 엔드포인트 (예: "posts", "comments")
 * @param {string} idOrQuery - ID 또는 쿼리 파라미터 (예: "1" 또는 "?postId=1")
 * @returns {Promise<any>} 응답 데이터
 */
export async function apiGet(endpoint, idOrQuery = "") {
  let url = `${API_BASE}/${endpoint}`;
  // 쿼리 파라미터인 경우 (?로 시작)
  // 왜 이렇게 구분하나? ID와 쿼리 파라미터를 모두 지원하기 위해
  if (idOrQuery && idOrQuery.startsWith("?")) {
    url += idOrQuery;
  } else if (idOrQuery) {
    // ID인 경우: /endpoint/id 형식
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

/**
 * POST 요청 함수
 * 서버에 새 데이터를 생성합니다.
 * 
 * 왜 필요한가?
 * - 데이터 생성: 게시글 작성, 댓글 작성, 회원가입 등에 사용
 * - JSON 데이터 전송: 객체를 JSON으로 변환하여 전송
 * - 성공 콜백 지원: 성공 시 추가 작업을 수행할 수 있게 함
 * 
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 전송할 데이터
 * @param {Function} onSuccess - 성공 시 실행할 콜백 함수 (선택적)
 * @returns {Promise<any>} 응답 데이터
 */
export async function apiPost(endpoint, data, onSuccess) {
  const headers = getHeaders();
  
  // 디버깅: 토큰이 있는지 확인
  // 왜 체크하나? 인증이 필요한 요청인데 토큰이 없으면 에러를 미리 방지
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("JWT 토큰이 없습니다. 다시 로그인해주세요.");
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  
  const requestConfig = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data), // 객체를 JSON 문자열로 변환
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

/**
 * PATCH 요청 함수
 * 서버의 기존 데이터를 일부 수정합니다.
 * 
 * 왜 필요한가?
 * - 데이터 수정: 게시글 수정, 댓글 수정, 사용자 정보 수정 등에 사용
 * - 부분 업데이트: 전체 데이터가 아닌 일부만 수정
 * - 특수 경로 지원: "1/view", "1/like" 같은 특수 경로 지원
 * 
 * @param {string} endpoint - API 엔드포인트
 * @param {string} id - 리소스 ID 또는 특수 경로 (예: "1" 또는 "1/view")
 * @param {Object} data - 수정할 데이터
 * @returns {Promise<any>} 응답 데이터
 */
export async function apiPatch(endpoint, id, data) {
  // id에 이미 경로가 포함된 경우 (예: "1/view", "1/like") 처리
  // 왜 이렇게 하나? 조회수 증가, 좋아요 같은 특수 엔드포인트를 지원하기 위해
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

/**
 * DELETE 요청 함수
 * 서버의 데이터를 삭제합니다.
 * 
 * 왜 필요한가?
 * - 데이터 삭제: 게시글 삭제, 댓글 삭제 등에 사용
 * - 간단한 인터페이스: 삭제는 데이터를 보낼 필요가 없으므로 간단한 인터페이스
 * 
 * @param {string} endpoint - API 엔드포인트
 * @param {string} id - 삭제할 리소스 ID
 * @returns {Promise<boolean>} 성공 시 true
 */
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

/**
 * 이미지 파일 업로드 함수
 * base64 이미지를 Blob으로 변환하여 서버에 업로드합니다.
 * 
 * 왜 필요한가?
 * - 파일 업로드: 크롭된 이미지를 서버에 업로드하고 경로를 받아옴
 * - base64 변환: 크롭된 이미지(base64)를 Blob으로 변환하여 FormData로 전송
 * 
 * @param {string} base64Image - base64 형식의 이미지 문자열
 * @returns {Promise<string>} 업로드된 파일의 경로 (예: /uploads/uuid-filename.jpg)
 */
export async function apiUploadImage(base64Image) {
  // base64 문자열을 Blob으로 변환
  // 왜 Blob으로 변환하나? FormData로 파일을 전송하기 위해
  const response = await fetch(base64Image);
  const blob = await response.blob();
  
  // FormData 생성
  const formData = new FormData();
  formData.append('file', blob, 'image.jpg');
  
  // 토큰 가져오기
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  
  // 파일 업로드 요청
  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
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
  return data.path; // 업로드된 파일의 경로 반환
}
