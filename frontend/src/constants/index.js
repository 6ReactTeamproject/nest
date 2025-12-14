/**
 * 애플리케이션 상수 모듈
 * API URL, 페이지네이션 설정, 메시지 등의 상수를 정의합니다.
 * 
 * 왜 필요한가?
 * - 하드코딩된 값들을 한 곳에 모아서 관리
 * - 유지보수성 향상: 값 변경 시 한 곳만 수정하면 됨
 * - 타입 안전성: 상수로 정의하여 오타 방지
 */

// API 기본 URL
// 왜 필요한가? 백엔드 서버 주소를 한 곳에서 관리하여 환경에 따라 쉽게 변경 가능
export const API_BASE_URL = "http://localhost:3000";

// 페이지네이션 설정
// 왜 필요한가? 한 페이지에 표시할 게시글 수를 상수로 관리하여 일관성 유지
export const POSTS_PER_PAGE = 5;

// 메시지 상수
// 왜 필요한가? 사용자에게 보여줄 메시지를 한 곳에서 관리하여 일관성 유지 및 다국어 지원 용이
export const MESSAGES = {
  REQUIRED_FIELD: "필수 항목을 입력해주세요.",
  CREATE_SUCCESS: "게시글이 생성되었습니다.",
  CREATE_FAIL: "게시글 생성에 실패했습니다.",
  UPDATE_SUCCESS: "수정이 완료되었습니다.",
  UPDATE_FAIL: "수정에 실패했습니다.",
  DELETE_CONFIRM: "삭제할까요?",
  LOGIN_REQUIRED: "댓글을 작성하려면 로그인하세요.",
  LOGIN_NEEDED: "로그인이 필요합니다.",
  LOGIN_FAIL: "로그인에 실패했습니다.",
  SIGNUP_SUCCESS: "회원가입이 완료되었습니다.",
  SIGNUP_FAIL: "회원가입에 실패했습니다.",
  PASSWORD_CHANGE_SUCCESS: "비밀번호가 변경되었습니다.",
  PASSWORD_CHANGE_FAIL: "비밀번호 변경에 실패했습니다.",
  NAME_CHANGE_SUCCESS: "닉네임이 변경되었습니다.",
  NAME_CHANGE_FAIL: "닉네임 변경에 실패했습니다.",
  COMMENT_CREATE_SUCCESS: "댓글이 작성되었습니다.",
  COMMENT_CREATE_FAIL: "댓글 작성에 실패했습니다.",
  COMMENT_UPDATE_SUCCESS: "댓글이 수정되었습니다.",
  COMMENT_UPDATE_FAIL: "댓글 수정에 실패했습니다.",
  COMMENT_DELETE_SUCCESS: "댓글이 삭제되었습니다.",
  COMMENT_DELETE_FAIL: "댓글 삭제에 실패했습니다.",
  MESSAGE_SEND_SUCCESS: "쪽지가 전송되었습니다.",
  MESSAGE_SEND_FAIL: "쪽지 전송에 실패했습니다.",
  LOADING: "로딩 중...",
  NO_DATA: "데이터가 없습니다.",
};
