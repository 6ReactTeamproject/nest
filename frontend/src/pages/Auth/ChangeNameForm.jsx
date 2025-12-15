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

  const handleChange = (e) => {
    const input = e.target.value;
    setName(input);
    if (input === '') {
      setIsValid(true);
    } else {
      setIsValid(nameRegex.test(input));
    }
  };

  return (
    <MypageLayout>
      <form onSubmit={handleSubmit} className="mypage-form">
        <h2 className="mypage-form-title">닉네임 변경</h2>

        <input
          type="text"
          placeholder="변경할 닉네임"
          value={name}
          onChange={handleChange}
          className="mypage-form-input"
          required
        />

        <button type="submit" className="mypage-form-button">
          변경하기
        </button>

        {!isValid && name && (
          <p className="mypage-form-error">특수문자는 사용할 수 없어요!</p>
        )}
      </form>
    </MypageLayout>
  );
}
