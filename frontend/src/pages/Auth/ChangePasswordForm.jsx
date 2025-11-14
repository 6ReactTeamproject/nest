import React, { useState } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import MypageLayout from "./MypageLayout";
import { apiPatch } from "../../api/fetch";
import { MESSAGES } from "../../constants";
import "../../styles/mypageform.css";

export default function ChangePasswordForm() {
  const { user } = useUser();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const { success, error: showError } = useToast();

  if (!user) return <p>{MESSAGES.LOGIN_NEEDED}</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPw || !newPw || !confirmPw) {
      showError("모든 비밀번호 필드를 입력해주세요.");
      return;
    }

    if (newPw !== confirmPw) {
      showError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await apiPatch("user", user.id, {
        password: newPw,
        currentPassword: currentPw,
      });

      success(MESSAGES.PASSWORD_CHANGE_SUCCESS);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      showError(err.message || MESSAGES.PASSWORD_CHANGE_FAIL);
    }
  };

  return (
    <MypageLayout>
      {/* 비밀번호 변경 폼 */}
      <form onSubmit={handleSubmit} className="mypage-form">
        <h2 className="mypage-form-title">비밀번호 변경</h2>

        {/* 현재 비밀번호 입력 필드 */}
        <input
          type="password"
          placeholder="현재 비밀번호"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className="mypage-form-input"
          required
        />

        {/* 새 비밀번호 입력 필드 */}
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="mypage-form-input"
          required
        />

        {/* 새 비밀번호 확인 입력 필드 */}
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          className="mypage-form-input"
          required
        />

        {/* 제출 버튼 */}
        <button type="submit" className="mypage-form-button">
          변경하기
        </button>
      </form>
    </MypageLayout>
  );
}
