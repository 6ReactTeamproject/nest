import React from "react";

// FormButton 컴포넌트: 버튼
export default function FormButton({
  onClick,        // 버튼 클릭
  children,       // 버튼 안에 표시될 내용
  type = "button",
  className,      // 스타일링을 위한 클래스명
}) {
  
  return (
     <button
      type={type}           // "button", "submit", "reset" 등 지정 가능
      onClick={onClick}     // 클릭 이벤트 핸들러
      className={className} // 외부에서 지정한 CSS 클래스 적용
    >
      {children}            {/* 버튼에 들어갈 콘텐츠 */}
    </button>
  );
}
