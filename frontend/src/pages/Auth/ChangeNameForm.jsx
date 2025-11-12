import React, { useState } from 'react';
import { useUser } from "../../hooks/UserContext";
import MypageLayout from "./MypageLayout";
import "../../styles/mypageform.css"; // 공통 스타일 import

export default function ChangeNameForm() {
  const { user, setUser } = useUser(); // 로그인된 사용자 정보와 상태 변경 함수 가져오기
  const [name, setName] = useState(""); // 입력된 닉네임 상태
  const [isValid, setIsValid] = useState(true); // 닉네임 유효성 여부

  // 로그인되지 않은 상태에서는 안내 메시지 출력
  if (!user) return <p>로그인이 필요합니다.</p>;

  // 한글, 영문, 숫자만 허용하는 정규표현식
  const nameRegex = /^[가-힣a-zA-Z0-9]+$/;

  // 폼 제출 시 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 닉네임이 정규식에 맞지 않으면 오류 처리
    if (!nameRegex.test(name)) {
      setIsValid(false);
      return;
    }

    // 현재 닉네임과 동일한 값 입력 시 알림
    if (name === user.name) {
      alert('현재 닉네임과 동일합니다.');
      return;
    }

    // 서버에 PATCH 요청을 보내 닉네임 업데이트
    try {
      const res = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      // 응답으로 받은 사용자 정보로 context와 localStorage 업데이트
      const updatedUser = await res.json();
      setUser({ ...user, name: updatedUser.name });
      localStorage.setItem('user', JSON.stringify({ ...user, name: updatedUser.name }));

      alert('닉네임이 변경되었습니다.');
      setName(""); // 입력 필드 초기화
    } catch (err) {
      console.error(err);
      alert('닉네임 변경 중 오류가 발생했습니다.');
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
