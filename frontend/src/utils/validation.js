// 다양한 타입의 값이 비어있는지 확인하는 함수
export const isEmpty = (value) => {
  if (typeof value === "string") {
    return !value.trim(); // 공백 문자열이면 true
  }
  if (Array.isArray(value)) {
    return value.length === 0; // 배열이 비어 있으면 true
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0; // 객체에 속성이 없으면 true
  }
  return !value; // 그 외 falsy 값들 처리
};

// 특정 필드들이 비어 있는지 확인하고 오류 메시지를 생성
export const validateRequired = (data, fields) => {
  const errors = {};

  // 필드 목록을 반복하며 값이 비어 있는 경우 오류 메시지 추가
  fields.forEach((field) => {
    if (isEmpty(data[field])) {
      errors[field] = `${field}는 필수 항목입니다.`; 
    }
  });

  return errors; // 오류가 담긴 객체 반환
};

// 이미지 파일의 타입을 검사하여 유효한지 여부를 반환
export const validateImage = (file) => {
  if (!file) return true; // 파일이 없으면 유효한 것으로 간주

  // 허용되는 이미지 타입 목록
  const validTypes = ["image/jpeg", "image/png", "image/gif"];

  // 파일의 MIME 타입이 허용된 형식에 포함되는지 확인
  return validTypes.includes(file.type);
};
