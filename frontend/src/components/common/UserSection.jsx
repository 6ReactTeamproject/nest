import { useEffect, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/travel.css";
import "../../styles/header.css";

// 헤더에 표시되는 사용자 정보 및 액션 섹션 컴포넌트
export function UserSection() {
  const { user, setUser } = useUser();
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const location = useLocation();

  // 컴포넌트 최초 렌더링 시 localStorage에서 유저 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPreview(parsedUser.image || ""); // 프로필 이미지
    }
    setIsLoading(false);
  }, [setUser]);

  // 유저 이미지가 변경될 때마다 preview 상태 업데이트
  useEffect(() => {
    if (user?.image) {
      setPreview(user.image);
    }
  }, [user?.image]);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token"); // JWT 토큰도 삭제
    setUser(null);
    nav("/login"); // 로그인 페이지로 이동
  };

  // 사용자 정보를 불러오는 동안 로딩 상태를 표시
  if (isLoading) return <p>로딩 중...</p>;

  return (
    <div className="user-section-container">
      {/* 사용자 프로필 이미지가 있는 경우에만 표시 */}
      {user && (
        <img src={preview} alt="프로필" className="user-profile-image" />
      )}
      <div className="user-info-container">
        {/* 환영 메시지 표시 */}
        <span className="user-welcome-text">
          {user ? `${user.name}님 환영합니다!` : "Guest님 환영합니다!"}
        </span>
        {/* 사용자의 로그인 상태에 따라 다른 버튼들을 표시 */}
        {user ? (
          // 로그인 상태일 때
          <>
            {/* 마이페이지가 아닐 때만 마이페이지 버튼 표시 */}
            {location.pathname !== "/mypage" && (
              <button onClick={() => nav("/mypage")} className="user-button">
                마이페이지
              </button>
            )}
            <button onClick={handleLogout} className="user-button">
              로그아웃
            </button>
          </>
        ) : (
          <>
          {/* 비로그인 상태일 때 로그인, 회원가입 버튼 */}
            <button onClick={() => nav("/login")} className="user-button">
              로그인
            </button>
            <button onClick={() => nav("/signup")} className="user-button">
              회원가입
            </button>
          </> 
        )}
      </div>
    </div>
  );
}
