import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/common/Toast";
import { API_BASE_URL, MESSAGES } from "../../constants";
import "../../styles/Signup.css"

const API_URL = `${API_BASE_URL}/auth`;

export function Signup() {
  // 사용자 입력 상태
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [passwd, setPassword] = useState("");

  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [idCheckColor, setIdCheckColor] = useState("black");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // 이름, 아이디, 비밀번호 형식을 검사하기 위한 정규식 정의
  const nameRegex = /^[가-힣a-zA-Z]+$/;
  const idRegex = /^[a-zA-Z0-9]+$/;
  const passwordRegex = /^[^\u3131-\uD79D]+$/;

  // 입력된 이름, 아이디, 패스워드가 정규식에 맞는지 검사
  const isNameValid = nameRegex.test(name);
  const isUserIdValid = idRegex.test(userId);
  const isPasswordValid = passwordRegex.test(passwd);

  // 아이디 중복 체크 요청 함수
  const checkDuplicateId = async () => {
    if (!userId) {
      setIdCheckMsg("아이디를 입력하세요.");
      setIdCheckColor("red");
      setIsIdChecked(false);
      return;
    }
    // 입력된 아이디가 정규식에 맞지 않는경우 실행
    if (!isUserIdValid) {
      setIdCheckMsg("아이디 형식이 올바르지 않습니다.");
      setIdCheckColor("red");
      setIsIdChecked(false);
      return;
    }

    try {
      // 서버에 입력한 아이디가 이미 존재하는지 확인 요청
      const res = await fetch(`${API_URL}/check-id?loginId=${userId}`);
      const data = await res.json();

      // 응답 결과에 따라 사용 가능 여부를 판단
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
          // image는 백엔드에서 디폴트 이미지로 자동 설정됨
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

        {/* 이름 입력 필드 */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (한글/영어만)"
        />
        {/* 조건부 랜더링 : 이름 입력했지만 형식이 잘못되었을 경우 출력 */}
        {name && !isNameValid && (
          <div className="warn">
            이름에는 숫자나 특수문자를 사용할 수 없습니다.
          </div>
        )}

        {/* 아이디 입력 및 중복확인 */}
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
        {/* 아이디 입력했지만 형식이 잘못되었을 경우 */}
        {userId && !isUserIdValid && (
          <div className="warn">특수문자 또는 한글은 사용할 수 없습니다.</div>
        )}
        {idCheckMsg && <div style={{ color: idCheckColor }}>{idCheckMsg}</div>}

        {/* 비밀번호 입력 */}
        <input
          type="password"
          value={passwd}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (한글 제외)"
        />
        {/* 비밀번호 입력했지만 형식이 잘못되었을 경우 */}
        {passwd && !isPasswordValid && (
          <div className="warn">비밀번호에 한글을 포함할 수 없습니다.</div>
        )}

        {/* 회원가입 버튼 */}
        <button onClick={handleSignup} disabled={isLoading}>
          {isLoading ? MESSAGES.LOADING : "회원가입"}
        </button>
      </div>
    </div>
  );
}

export default Signup;
