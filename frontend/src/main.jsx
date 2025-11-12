import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { UserContext } from "./hooks/UserContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Root() {
  const [user, setUser] = useState(null); // 사용자 정보를 저장

  useEffect(() => {
    // 브라우저 localStorage에 저장된 사용자 정보를 불러와 초기 설정
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved)); // 문자열을 객체로 변환 후 저장
    }
  }, []);

  return (
    // 전역에서 user 정보를 공유할 수 있도록 Context API 설정
    <UserContext.Provider value={{ user, setUser }}>
      {/* React Router를 통한 라우팅 처리 */}
      <BrowserRouter>
        <AppRouter setUser={setUser} /> {/* 라우터에 setUser 전달 */}
      </BrowserRouter>
    </UserContext.Provider>
  );
}

// 루트 DOM 요소에 앱을 마운트
createRoot(document.getElementById("root")).render(<Root />);
