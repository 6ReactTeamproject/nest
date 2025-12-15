import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/common/Toast";
import { API_BASE_URL, MESSAGES } from "../../constants";
import "../../styles/Signup.css"

const API_URL = `${API_BASE_URL}/auth`;

export function Signup() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [passwd, setPassword] = useState("");

  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [idCheckColor, setIdCheckColor] = useState("black");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const nameRegex = /^[가-힣a-zA-Z]+$/;
  const idRegex = /^[a-zA-Z0-9]+$/;
  const passwordRegex = /^[^\u3131-\uD79D]+$/;

  const isNameValid = nameRegex.test(name);
  const isUserIdValid = idRegex.test(userId);
  const isPasswordValid = passwordRegex.test(passwd);

  const checkDuplicateId = async () => {
    if (!userId) {
      setIdCheckMsg("아이디를 입력하세요.");
      setIdCheckColor("red");
      setIsIdChecked(false);
      return;
    }
    if (!isUserIdValid) {
      setIdCheckMsg("아이디 형식이 올바르지 않습니다.");
      setIdCheckColor("red");
      setIsIdChecked(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/check-id?loginId=${userId}`);
      const data = await res.json();

      if (data.exists) {
        setIdCheckMsg("이미 존재하는 아이디입니다.");
        setIdCheckColor("red");
        setIsIdChecked(false);
      } else {
        setIdCheckMsg("사용 가능한 아이디입니다.");
        setIdCheckColor("green");
        setIsIdChecked(true);
      }
    } catch (err) {
      console.error("중복 확인 중 오류:", err);
      setIdCheckMsg("중복 확인 중 오류가 발생했습니다.");
      setIdCheckColor("red");
      setIsIdChecked(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !userId || !passwd) {
      showError("모든 항목을 입력하세요.");
      return;
    }

    if (!isNameValid) {
      showError("이름 형식이 올바르지 않습니다.");
      return;
    }
    if (!isUserIdValid) {
      showError("아이디 형식이 올바르지 않습니다.");
      return;
    }
    if (!isPasswordValid) {
      showError("비밀번호에 한글을 포함할 수 없습니다.");
      return;
    }
    if (!isIdChecked) {
      showError("아이디 중복확인 필수");
      return;
    }

    try {
      setIsLoading(true);
      const postRes = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          loginId: userId,
          password: passwd,
        }),
      });

      if (!postRes.ok) {
        const error = await postRes.json();
        showError(error.message || MESSAGES.SIGNUP_FAIL);
        return;
      }

      const data = await postRes.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      success(MESSAGES.SIGNUP_SUCCESS);
      setName("");
      setUserId("");
      setPassword("");
      setIdCheckMsg("");
      setIsIdChecked(false);
      navigate("/login");
    } catch (err) {
      showError(err.message || "서버와의 통신 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2>회원가입</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (한글/영어만)"
        />
        {name && !isNameValid && (
          <div className="warn">
            이름에는 숫자나 특수문자를 사용할 수 없습니다.
          </div>
        )}

        <div className="id-check">
          <input
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setIdCheckMsg("");
              setIsIdChecked(false);
            }}
            placeholder="아이디 (영문/숫자만)"
          />
          <button onClick={checkDuplicateId}>중복확인</button>
        </div>
        {userId && !isUserIdValid && (
          <div className="warn">특수문자 또는 한글은 사용할 수 없습니다.</div>
        )}
        {idCheckMsg && <div style={{ color: idCheckColor }}>{idCheckMsg}</div>}

        <input
          type="password"
          value={passwd}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (한글 제외)"
        />
        {passwd && !isPasswordValid && (
          <div className="warn">비밀번호에 한글을 포함할 수 없습니다.</div>
        )}

        <button onClick={handleSignup} disabled={isLoading}>
          {isLoading ? MESSAGES.LOADING : "회원가입"}
        </button>
      </div>
    </div>
  );
}

export default Signup;
