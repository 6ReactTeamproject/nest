import React from "react";

// FormTextarea 컴포넌트: 여러 줄 텍스트
export default function FormTextarea({
  name,       // textarea 요소의 name 속성
  value,      // 현재 입력된 텍스트 값
  onChange,   // 입력 내용이 변경될 때 호출되는 콜백 함수
  placeholder,// 텍스트 영역에 표시될 힌트 문구
  className,  // 외부에서 전달된 CSS 클래스명
}) {
  // HTML 기본 textarea 태그를 래핑하여 재사용성을 높임
  return (
    <textarea
      name={name}            // 폼 제출 시 식별되는 이름
      value={value}          // 현재 입력값
      onChange={onChange}    // 값이 바뀔 때 실행할 이벤트 핸들러
      placeholder={placeholder} // 사용자에게 보여주는 힌트 텍스트
      className={className}  // 스타일 적용을 위한 클래스
    />
  );
}
