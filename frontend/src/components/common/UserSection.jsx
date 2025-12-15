import { useEffect, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/travel.css";
import "../../styles/header.css";

export function UserSection() {
  const { user, setUser } = useUser();
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPreview(parsedUser.image || "");
    }
    setIsLoading(false);
  }, [setUser]);

  useEffect(() => {
    if (user?.image) {
      setPreview(user.image);
    }
  }, [user?.image]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    nav("/login");
  };

  if (isLoading) return <p>로딩 중...</p>;

  return (
    <div className="user-section-container">
      {user && preview && (
        <img src={preview} alt="프로필" className="user-profile-image" />
      )}
      <div className="user-info-container">
        <span className="user-welcome-text">
          {user ? `${user.name}님 환영합니다!` : "Guest님 환영합니다!"}
        </span>
        {user ? (
          <>
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
