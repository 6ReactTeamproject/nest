import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { API_BASE_URL, MESSAGES } from "../../constants";
import "../../styles/Login.css";

export default function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { success, error: showError } = useToast();

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      setIsLoading(true);
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        showError(error.message || MESSAGES.LOGIN_FAIL);
        return;
      }

      const data = await res.json();
      
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setUser(data.user);

      const lastPublic = sessionStorage.getItem("lastPublicPath") || "/";
      const target = lastPublic === "/login" || lastPublic === "/signup" ? "/" : lastPublic;
      
      success("로그인 성공!");
      navigate(target);
    } catch (err) {
      showError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
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
