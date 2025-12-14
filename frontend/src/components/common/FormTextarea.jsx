/**
 * 공통 텍스트 영역 컴포넌트
 * HTML textarea 요소를 래핑한 재사용 가능한 컴포넌트입니다.
 * 
 * 왜 필요한가?
 * - 코드 재사용성: 여러 곳에서 사용하는 텍스트 영역을 한 번만 정의
 * - 일관된 스타일: 모든 텍스트 영역이 동일한 스타일과 동작을 가짐
 * - 유지보수성: 텍스트 영역의 공통 로직을 한 곳에서 관리
 * - Props 인터페이스 표준화: 모든 텍스트 영역이 동일한 방식으로 사용됨
 */

import React from "react";

export default function FormTextarea({
  name,       // textarea 요소의 name 속성
  value,      // 현재 입력된 텍스트 값
  onChange,   // 입력 내용이 변경될 때 호출되는 콜백 함수
  placeholder,// 텍스트 영역에 표시될 힌트 문구
  className,  // 외부에서 전달된 CSS 클래스명
}) {
  // HTML 기본 textarea 태그를 래핑하여 재사용성을 높임
  // 왜 래핑하나? 공통 로직과 스타일을 한 곳에서 관리하기 위해
  return (
    <textarea
      name={name}            // 폼 제출 시 식별되는 이름
      value={value}          // 현재 입력값: 제어 컴포넌트 패턴 (React가 값을 제어)
      onChange={onChange}    // 값이 바뀔 때 실행할 이벤트 핸들러
      placeholder={placeholder} // 사용자에게 보여주는 힌트 텍스트
      className={className}  // 스타일 적용을 위한 클래스
    />
  );
}
