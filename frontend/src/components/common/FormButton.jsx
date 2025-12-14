/**
 * 공통 버튼 컴포넌트
 * HTML button 요소를 래핑한 재사용 가능한 컴포넌트입니다.
 * 
 * 왜 필요한가?
 * - 코드 재사용성: 여러 곳에서 사용하는 버튼을 한 번만 정의
 * - 일관된 스타일: 모든 버튼이 동일한 스타일과 동작을 가짐
 * - 유지보수성: 버튼의 공통 로직을 한 곳에서 관리
 * - Props 인터페이스 표준화: 모든 버튼이 동일한 방식으로 사용됨
 */

import React from "react";

export default function FormButton({
  onClick,        // 버튼 클릭 시 실행될 이벤트 핸들러
  children,       // 버튼 안에 표시될 내용 (텍스트 또는 다른 컴포넌트)
  type = "button",// 버튼 타입 (기본값: "button", "submit", "reset" 등)
  className,      // 스타일링을 위한 클래스명
}) {
  // HTML 기본 button 태그를 래핑하여 재사용성을 높임
  // 왜 래핑하나? 공통 로직과 스타일을 한 곳에서 관리하기 위해
  return (
     <button
      type={type}           // "button", "submit", "reset" 등 지정 가능
      // submit: 폼 제출 시 사용, button: 일반 버튼, reset: 폼 초기화
      onClick={onClick}     // 클릭 이벤트 핸들러
      className={className} // 외부에서 지정한 CSS 클래스 적용
    >
      {children}            {/* 버튼에 들어갈 콘텐츠 (텍스트 또는 다른 컴포넌트) */}
    </button>
  );
}
