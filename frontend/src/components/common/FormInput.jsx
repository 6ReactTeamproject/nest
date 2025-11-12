import React from "react";

// FormInput 컴포넌트: 입력 칸
export default function FormInput({
  name,         // input 요소의 name 속성
  value,        // 현재 입력값
  onChange,     // 값이 변경될 때 호출되는 이벤트 핸들러
  placeholder,  // 입력창에 표시되는 힌트 텍스트
  type = "text",// 입력 타입
  className,    // 외부에서 스타일을 지정할 때 사용할 CSS 클래스
}) {
  // HTML 기본 input 태그를 래핑하여 재사용성을 높임
  return (
   <input
      type={type}             // 입력 칸 타입 지정
      name={name}             // name 속성
      value={value}           // 현재 값
      onChange={onChange}     // 입력 시 실행될 이벤트 핸들러
      placeholder={placeholder} // 입력 전 표시되는 안내 문구
      className={className}   // 스타일 적용을 위한 클래스
    />
  );
}
