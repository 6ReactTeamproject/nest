import React, { useState } from 'react';
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { apiPatch } from "../../api/fetch";
import MypageLayout from "./MypageLayout";
import { MESSAGES } from "../../constants";
import "../../styles/mypageform.css";

export default function ChangeNameForm() {
  const { user, setUser } = useUser();
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { success, error: showError } = useToast();

  if (!user) return <p>{MESSAGES.LOGIN_NEEDED}</p>;

  const nameRegex = /^[가-힣a-zA-Z0-9]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameRegex.test(name)) {
      setIsValid(false);
      return;
    }

    if (name === user.name) {
      showError('현재 닉네임과 동일합니다.');
      return;
    }

    try {
      const updatedUser = await apiPatch("user", user.id, { name });
      setUser({ ...user, name: updatedUser.name });
      localStorage.setItem('user', JSON.stringify({ ...user, name: updatedUser.name }));

      success(MESSAGES.NAME_CHANGE_SUCCESS);
      setName("");
    } catch (err) {
      showError(err.message || MESSAGES.NAME_CHANGE_FAIL);
    }
  };

  // 닉네임 입력 값이 변경될 때 실행되는 함수
  const handleChange = (e) => {
    const input = e.target.value;
    setName(input);
    // 빈 문자열일 경우 유효성 메시지 제거, 그렇지 않으면 유효성 검사
    if (input === '') {
      setIsValid(true);
    } else {
      setIsValid(nameRegex.test(input));
    }
  };

  return (
    <MypageLayout>
      {/* 닉네임 변경 폼 */}
      <form onSubmit={handleSubmit} className="mypage-form">
        <h2 className="mypage-form-title">닉네임 변경</h2>

        {/* 닉네임 입력 필드 */}
        <input
          type="text"
          placeholder="변경할 닉네임"
          value={name}
          onChange={handleChange}
          className="mypage-form-input"
          required
        />

        {/* 제출 버튼 */}
        <button type="submit" className="mypage-form-button">
          변경하기
        </button>

        {/* 유효하지 않은 닉네임일 경우 경고 메시지 표시 */}
        {!isValid && name && (
          <p className="mypage-form-error">특수문자는 사용할 수 없어요!</p>
        )}
      </form>
    </MypageLayout>
  );
}
