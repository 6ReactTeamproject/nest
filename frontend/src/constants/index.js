export const API_BASE_URL = "http://localhost:3001"; 
// API 호출 시 기본 URL

export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]; 
// 허용되는 이미지 파일 타입

export const ROUTES = {
  HOME: "/",        // 홈 페이지 경로
  TEAM: "/team",    // 팀 페이지 경로
  INTRO: "/intro",  // 여행지 소개 페이지 경로
  LOGIN: "/login",  // 로그인 페이지 경로
  SIGNUP: "/signup",// 회원가입 페이지 경로
  BOARD: "/board",  // 게시판 목록 페이지 경로
  POST: "/post",    // 게시글 작성/수정 페이지 경로
};

export const MESSAGES = {
  REQUIRED_FIELD: "필수 항목을 입력해주세요.",         // 필수 입력 경고 메시지
  CREATE_SUCCESS: "게시글이 생성되었습니다.",         // 게시글 생성 성공 메시지
  CREATE_FAIL: "게시글 생성에 실패했습니다.",          // 게시글 생성 실패 메시지
  UPDATE_SUCCESS: "수정이 완료되었습니다.",           // 게시글 수정 성공 메시지
  UPDATE_FAIL: "수정에 실패했습니다.",                // 게시글 수정 실패 메시지
  DELETE_CONFIRM: "삭제할까요?",                      // 삭제 확인 메시지
  LOGIN_REQUIRED: "댓글을 작성하려면 로그인하세요.",   // 로그인 필요 메시지
};
