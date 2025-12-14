/**
 * React 애플리케이션 진입점
 * 애플리케이션을 초기화하고 전역 상태와 라우팅을 설정합니다.
 * 
 * 왜 필요한가?
 * - 애플리케이션 초기화: React 앱을 DOM에 마운트
 * - 전역 상태 설정: UserContext를 통해 사용자 정보를 전역으로 관리
 * - 라우팅 설정: BrowserRouter를 통해 페이지 라우팅 활성화
 * - 로그인 상태 복원: localStorage에서 사용자 정보를 불러와 초기 상태 설정
 */

import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { UserContext } from "./hooks/UserContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Root() {
  // 사용자 정보 상태 관리
  // 왜 useState를 사용하나? 사용자 로그인 상태를 추적하고 전역으로 공유하기 위해
  const [user, setUser] = useState(null);

  /**
   * 초기 사용자 정보 로드 효과
   * 컴포넌트 마운트 시 localStorage에서 사용자 정보를 불러옵니다.
   * 
   * 왜 필요한가?
   * - 로그인 상태 유지: 페이지 새로고침 후에도 로그인 상태 유지
   * - 사용자 정보 복원: localStorage에 저장된 사용자 정보를 불러와 전역 상태에 설정
   */
  useEffect(() => {
    // 브라우저 localStorage에 저장된 사용자 정보를 불러와 초기 설정
    // 왜 localStorage인가? 페이지 새로고침 후에도 데이터가 유지되므로
    const saved = localStorage.getItem("user");
    if (saved) {
      // JSON.parse: 문자열로 저장된 사용자 정보를 객체로 변환
      // 왜 JSON으로 저장하나? localStorage는 문자열만 저장할 수 있으므로
      setUser(JSON.parse(saved));
    }
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  return (
    // 전역에서 user 정보를 공유할 수 있도록 Context API 설정
    // 왜 Context를 사용하나? 여러 컴포넌트에서 사용자 정보를 쉽게 접근하기 위해
    <UserContext.Provider value={{ user, setUser }}>
      {/* React Router를 통한 라우팅 처리 */}
      {/* BrowserRouter: HTML5 History API를 사용하여 라우팅 */}
      {/* 왜 필요한가? URL 기반 라우팅을 통해 페이지 간 이동을 관리 */}
      <BrowserRouter>
        {/* AppRouter: 실제 라우트 정의 컴포넌트 */}
        <AppRouter setUser={setUser} /> {/* 라우터에 setUser 전달 (로그아웃 시 사용) */}
      </BrowserRouter>
    </UserContext.Provider>
  );
}

// 루트 DOM 요소에 앱을 마운트
// createRoot: React 18의 새로운 API로 앱을 렌더링
// 왜 필요한가? React 앱을 실제 DOM에 연결하여 화면에 표시하기 위해
createRoot(document.getElementById("root")).render(<Root />);
