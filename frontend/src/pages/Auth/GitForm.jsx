import React, { useState } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { apiPatch } from "../../api/fetch";
import { MESSAGES } from "../../constants";

export default function GitForm() {
  const { user, setUser } = useUser();
  const [gitInput, setGitInput] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { success, error: showError } = useToast();

  const gitIdRegex = /^[a-zA-Z0-9-_]*$/;

  const handleGitUpdate = async () => {
    const trimmedInput = gitInput.trim();

    if (!trimmedInput) {
      showError("깃허브 주소를 입력해주세요.");
      return;
    }

    if (!gitIdRegex.test(trimmedInput.replace("https://github.com/", ""))) {
      showError("깃허브 ID는 영문자와 숫자, -, _만 사용할 수 있습니다.");
      return;
    }

    let finalUrl = trimmedInput;
    if (!trimmedInput.startsWith("https://github.com/")) {
      finalUrl = "https://github.com/" + trimmedInput.replace(/^\/+/, '');
    }

    try {
      const updatedUser = await apiPatch("user", user.id, { giturl: finalUrl });
      setUser(updatedUser);
      setGitInput("");
      success("깃허브 주소가 저장되었습니다.");
    } catch (err) {
      showError(err.message || "오류 발생");
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
