import React from "react";

export default function FormButton({
  onClick,
  children,
  type = "button",
  className,
}) {
  return (
     <button
      type={type}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}
