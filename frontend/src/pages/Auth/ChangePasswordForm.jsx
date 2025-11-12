import React, { useState } from "react";
import { useUser } from "../../hooks/UserContext";
import MypageLayout from "./MypageLayout";
import "../../styles/mypageform.css";

export default function ChangePasswordForm() {
  const { user } = useUser(); // 로그인한 사용자 정보 가져오기
  const [currentPw, setCurrentPw] = useState(""); // 현재 비밀번호 입력값 상태
  const [newPw, setNewPw] = useState(""); // 새 비밀번호 입력값 상태
  const [confirmPw, setConfirmPw] = useState(""); // 새 비밀번호 확인 입력값 상태

  // 로그인하지 않은 경우 메시지 출력
  if (!user) return <p>로그인이 필요합니다.</p>;

  // 폼 제출 시 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 제출 동작 방지

    // 입력 필드 중 하나라도 비어 있으면 경고
    if (!currentPw || !newPw || !confirmPw) {
      alert("모든 비밀번호 필드를 입력해주세요.");
      return;
    }

    // 새 비밀번호와 확인 비밀번호가 다르면 경고
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 현재 사용자의 비밀번호를 서버에서 다시 가져옴
      const res = await fetch(`http://localhost:3001/users/${user.id}`);
      const userData = await res.json();

      // 입력한 현재 비밀번호와 서버에 저장된 비밀번호 비교
      if (userData.password !== currentPw) {
        alert("현재 비밀번호가 틀립니다.");
        return;
      }

      // 비밀번호가 맞으면 PATCH 요청으로 새 비밀번호 저장
      const updateRes = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPw }),
      });

      if (updateRes.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        // 입력 필드 초기화
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        alert("비밀번호 변경 실패: 서버 오류");
      }
    } catch (error) {
      console.error("비밀번호 변경 중 오류:", error);
      alert("비밀번호 변경 실패: 통신 오류");
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
