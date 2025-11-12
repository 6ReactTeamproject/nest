import React, { useState } from "react";
import { useUser } from "../../hooks/UserContext";

export default function GitForm() {
  const { user, setUser } = useUser(); // 로그인된 사용자 정보와 setter 가져오기
  const [gitInput, setGitInput] = useState(""); // 입력된 깃허브 주소 상태
  const [isValid, setIsValid] = useState(true); // 유효성 검사 결과 상태

  // 깃허브 ID로 사용할 수 있는 문자 제한: 영문, 숫자, 하이픈, 언더스코어만 허용
  const gitIdRegex = /^[a-zA-Z0-9-_]*$/;

  // 깃허브 주소 저장 버튼 클릭 시 실행
  const handleGitUpdate = async () => {
    const trimmedInput = gitInput.trim(); // 공백 제거

    // 입력값이 비어 있으면 경고
    if (!trimmedInput) {
      alert("깃허브 주소를 입력해주세요.");
      return;
    }

    // 입력값에서 'https://github.com/'을 제외한 ID 부분만 추출하여 검사
    if (!gitIdRegex.test(trimmedInput.replace("https://github.com/", ""))) {
      alert("깃허브 ID는 영문자와 숫자, -, _만 사용할 수 있습니다.");
      return;
    }

    // 주소가 https://github.com/로 시작하지 않으면 붙여줌
    let finalUrl = trimmedInput;
    if (!trimmedInput.startsWith("https://github.com/")) {
      finalUrl = "https://github.com/" + trimmedInput.replace(/^\/+/, '');
    }

    // PATCH 요청으로 서버에 사용자 깃허브 주소 업데이트
    try {
      const res = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giturl: finalUrl }),
      });

      // 요청 성공 시 사용자 정보 업데이트 및 알림
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setGitInput(""); // 입력 필드 초기화
        alert("깃허브 주소가 저장되었습니다.");
      } else {
        alert("저장 실패");
      }
    } catch (error) {
      console.error("에러:", error);
      alert("오류 발생");
    }
  };

  // 입력 필드 값 변경 시 실행되는 함수
  const handleChange = (e) => {
    const input = e.target.value;
    setGitInput(input);

    // 깃허브 주소에서 ID 부분만 유효성 검사 (앞 주소 제거)
    const idPart = input.replace("https://github.com/", "");
    setIsValid(gitIdRegex.test(idPart));
  };

  return (
    <>
      {/* 현재 저장된 깃허브 주소를 보여주는 영역 */}
      <p>
        깃허브 주소 :
        {user.giturl ? (
          <a
            href={user.giturl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ffffff" }}
          >
            {user.giturl}
          </a>
        ) : (
          <span style={{ color: "gray" }}> 주소를 입력해 주세요 </span>
        )}
      </p>

      {/* 입력 필드 및 저장 버튼 영역 */}
      <div className="giturl-form" style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={gitInput}
          onChange={handleChange}
          placeholder="https://github.com/ 생략 가능"
          style={{ marginRight: "8px", padding: "4px" }}
        />
        <button onClick={handleGitUpdate}>저장</button>
      </div>
    </>
  );
}
