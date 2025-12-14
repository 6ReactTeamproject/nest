/**
 * 공통 입력 컴포넌트
 * HTML input 요소를 래핑한 재사용 가능한 컴포넌트입니다.
 * 
 * 왜 필요한가?
 * - 코드 재사용성: 여러 곳에서 사용하는 입력 필드를 한 번만 정의
 * - 일관된 스타일: 모든 입력 필드가 동일한 스타일과 동작을 가짐
 * - 유지보수성: 입력 필드의 공통 로직을 한 곳에서 관리
 * - Props 인터페이스 표준화: 모든 입력 필드가 동일한 방식으로 사용됨
 */

import React from "react";

export default function FormInput({
  name,         // input 요소의 name 속성
  value,        // 현재 입력값
  onChange,     // 값이 변경될 때 호출되는 이벤트 핸들러
  placeholder,  // 입력창에 표시되는 힌트 텍스트
  type = "text",// 입력 타입 (기본값: "text")
  className,    // 외부에서 스타일을 지정할 때 사용할 CSS 클래스
}) {
  // HTML 기본 input 태그를 래핑하여 재사용성을 높임
  // 왜 래핑하나? 공통 로직과 스타일을 한 곳에서 관리하기 위해
  return (
   <input
      type={type}             // 입력 칸 타입 지정 (text, password, email 등)
      name={name}             // name 속성: 폼 제출 시 식별자로 사용
      value={value}           // 현재 값: 제어 컴포넌트 패턴 (React가 값을 제어)
      onChange={onChange}     // 입력 시 실행될 이벤트 핸들러
      placeholder={placeholder} // 입력 전 표시되는 안내 문구
      className={className}   // 스타일 적용을 위한 클래스
    />
  );
}
