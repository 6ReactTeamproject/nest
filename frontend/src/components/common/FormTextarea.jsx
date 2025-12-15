import React from "react";

export default function FormTextarea({
  name,
  value,
  onChange,
  placeholder,
  className,
}) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
