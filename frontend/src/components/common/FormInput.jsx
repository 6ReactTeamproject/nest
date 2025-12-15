import React from "react";

export default function FormInput({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}) {
  return (
   <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
