import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants";
import "../../styles/Signup.css"

const API_URL = `${API_BASE_URL}/users`;

export function Signup() {
  // 사용자 입력 상태
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [passwd, setPassword] = useState("");

  // 아이디 중복 확인 관련 상태
  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [idCheckColor, setIdCheckColor] = useState("black");
  const [isIdChecked, setIsIdChecked] = useState(false);

  // 기본 이미지를 URL에 있는 이미지로
  const defaultImageURL = "https://i.ibb.co/Fz1bk4g/default-profile.png";
  const navigate = useNavigate();

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
      // 서버에 입력한 아이디가 이미 존재하는지 json에 확인 요청
      const res = await fetch(`${API_URL}?loginId=${userId}`);
      // 응답받은 사용자 목록(json)을 자바스크립트 객체로 변환
      const users = await res.json();

      // 응답 결과에 따라 사용 가능 여부를 판단
      if (users.length > 0) {
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

  // 회원가입 처리 함수 (폼 제출 시 실행)
  const handleSignup = async () => {
    // 사용자가 입력하지 않은 항목이 있을 경우 경고
    if (!name || !userId || !passwd) {
      alert("모든 항목을 입력하세요.");
      return;
    }

    // 각 필드의 유효성 검사 결과가 false일 경우 경고 표시
    if (!isNameValid) {
      alert("이름 형식이 올바르지 않습니다.");
      return;
    }
    if (!isUserIdValid) {
      alert("아이디 형식이 올바르지 않습니다.");
      return;
    }
    if (!isPasswordValid) {
      alert("비밀번호에 한글을 포함할 수 없습니다.");
      return;
    }
    if (!isIdChecked) {
      alert("아이디 중복확인 필수");
      return;
    }

    try {
      // 서버에 사용자 정보를 전송하여 회원가입 요청 수행
      const postRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          loginId: userId,
          password: passwd,
          image: defaultImageURL,
          grade: "일반회원",
          giturl: "",
        }),
      });

      if (postRes.ok) {
        alert("회원가입 성공!");
        setName("");
        setUserId("");
        setPassword("");
        setIdCheckMsg("");
        setIsIdChecked(false);
        navigate("/login"); // 로그인 페이지로 이동
      } else {
        alert("회원가입 실패! 서버 오류");
      }
    } catch (err) {
      console.error("에러 발생:", err);
      alert("서버와의 통신 중 문제가 발생했습니다.");
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
        <button onClick={handleSignup}>회원가입</button>
      </div>
    </div>
  );
}

export default Signup;
