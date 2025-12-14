/**
 * 인증 처리 유틸리티 함수
 * 사용자 인증 상태를 확인하고 적절한 페이지로 리다이렉트합니다.
 * 
 * 왜 필요한가?
 * - 인증이 필요한 페이지 접근 시 로그인 여부 확인
 * - 로그인하지 않은 사용자를 로그인 페이지로 자동 리다이렉트
 * - 코드 중복 제거: 여러 컴포넌트에서 사용하는 인증 로직을 한 곳에 모음
 * 
 * @param {Object|null} user - 현재 로그인한 사용자 정보 (없으면 null)
 * @param {Function} navigate - React Router의 navigate 함수
 * @param {string} add - 인증된 사용자가 이동할 경로
 */
import { useToast } from "./Toast";
import { MESSAGES } from "../../constants";

export default function HandleAuth(user, navigate, add) {
  // 사용자가 로그인하지 않았으면
  // 왜 체크하나? 인증이 필요한 기능에 접근하려 할 때 로그인 페이지로 보내기 위해
  if (!user) {
    // Toast는 컴포넌트 내에서만 사용 가능하므로 alert 유지 (간단한 유틸 함수)
    // 왜 alert를 사용하나? 이 함수는 컴포넌트 외부에서도 사용할 수 있어야 하므로
    alert(MESSAGES.LOGIN_NEEDED);
    // 로그인 페이지로 리다이렉트
    navigate("/login");
  } else {
    // 로그인한 사용자는 원하는 페이지로 이동
    navigate(add);
  }
}
