/**
 * 로그인 페이지 컴포넌트
 * 사용자가 아이디와 비밀번호로 로그인할 수 있는 페이지입니다.
 * 
 * 왜 필요한가?
 * - 사용자 인증: 로그인하지 않은 사용자가 서비스를 이용할 수 있게 함
 * - 토큰 관리: 로그인 성공 시 JWT 토큰을 localStorage에 저장
 * - 사용자 상태 업데이트: 로그인 후 전역 사용자 상태 업데이트
 * - 리다이렉트: 로그인 전 방문했던 페이지로 자동 이동
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { API_BASE_URL, MESSAGES } from "../../constants";
import "../../styles/Login.css";

export default function Login() {
  // 로그인 폼 상태 관리
  // 왜 useState를 사용하나? 사용자 입력값을 추적하고 폼 제어를 위해
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  // 로딩 상태: 로그인 요청 중인지 추적
  // 왜 필요한가? 중복 요청 방지 및 사용자에게 로딩 상태 표시
  const [isLoading, setIsLoading] = useState(false);
  
  // React Router의 navigate 훅: 페이지 이동을 위해
  const navigate = useNavigate();
  // 전역 사용자 상태 업데이트 함수
  const { setUser } = useUser();
  // Toast 알림 함수들
  const { success, error: showError } = useToast();

  /**
   * 로그인 처리 함수
   * 사용자가 입력한 아이디와 비밀번호로 로그인을 시도합니다.
   * 
   * 왜 필요한가?
   * - 사용자 인증: 백엔드에 로그인 요청을 보내 인증 처리
   * - 토큰 저장: 로그인 성공 시 JWT 토큰을 localStorage에 저장
   * - 상태 업데이트: 전역 사용자 상태를 업데이트하여 다른 컴포넌트에서 사용 가능하게 함
   */
  const handleLogin = async () => {
    // 입력값 검증: 빈 값이면 에러 표시
    // 왜 필요한가? 서버에 불필요한 요청을 보내지 않기 위해
    if (!loginId.trim() || !password.trim()) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      // 로딩 상태 시작: 중복 요청 방지 및 UI 업데이트
      setIsLoading(true);
      
      // 로그인 API 요청
      // 왜 fetch를 직접 사용하나? apiPost를 사용하지 않는 이유는 토큰이 없어서
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      // 응답이 실패하면 에러 처리
      if (!res.ok) {
        const error = await res.json();
        showError(error.message || MESSAGES.LOGIN_FAIL);
        return;
      }

      // 로그인 성공: 응답 데이터에서 토큰과 사용자 정보 추출
      const data = await res.json();
      
      // localStorage에 토큰 저장
      // 왜 localStorage인가? 페이지 새로고침 후에도 로그인 상태 유지
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // 전역 사용자 상태 업데이트: 다른 컴포넌트에서 사용자 정보 사용 가능
      setUser(data.user);

      // 로그인 전 방문했던 페이지로 리다이렉트
      // sessionStorage: 브라우저 탭이 닫히면 삭제되는 임시 저장소
      // 왜 이렇게 하나? 로그인 전에 방문했던 페이지로 돌아가기 위해
      const lastPublic = sessionStorage.getItem("lastPublicPath") || "/";
      // 로그인/회원가입 페이지는 제외하고 홈으로 이동
      const target = lastPublic === "/login" || lastPublic === "/signup" ? "/" : lastPublic;
      
      success("로그인 성공!");
      navigate(target);
    } catch (err) {
      // 네트워크 오류 등 예외 처리
      showError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      // 로딩 상태 종료: 성공/실패와 관계없이 항상 실행
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <input
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? MESSAGES.LOADING : "로그인"}
        </button>
      </div>
      <button className="signup-button" onClick={() => navigate("/signup")}>
        회원가입
      </button>
    </div>
  );
}
