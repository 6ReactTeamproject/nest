import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext"; // 사용자 정보 Context 훅 import
import "../../styles/Login.css";

export default function Login() {
  // 아이디, 비밀번호 입력값 관리 상태 정의 
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // 페이지 이동을 위한 훅
  const navigate = useNavigate();

  // 로그인 성공시 전역 사용자 정보를 저장
  const { setUser } = useUser();

  // 로그인 처리 함수
  const handleLogin = () => {
    // 로그인 API 호출 : GET 쿼리로 아이디, 비밀번호를 전달
    fetch(`http://localhost:3001/users?loginId=${loginId}&password=${password}`)
      .then((res) => res.json())
      .then((data) => {

        // 로그인 성공 : 조건에 맞는 유저가 배열로 반환될 경우 1
        if (data.length > 0) {
          const user = data[0];

          // 로그인 성공한 유저 정보 로컬스토리지 저장
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          // 세션에 저장된 마지막 비인증 페이지 경로 가져오기
          const lastPublic = sessionStorage.getItem("lastPublicPath") || "/";
          // 만약 lastPublic이 로그인 또는 회원가입 페이지라면 기본값을 "/"
          const target =
            lastPublic === "/login" || lastPublic === "/signup"
              ? "/"
              : lastPublic;
          // 설정된 경로로 페이지 이동    
          navigate(target);
        } else {
          alert("로그인 실패");
        }
      });
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
        <button onClick={handleLogin}>로그인</button>
      </div>
      <button className="signup-button" onClick={() => navigate("/signup")}>
        회원가입
      </button>
    </div>
  );
}
