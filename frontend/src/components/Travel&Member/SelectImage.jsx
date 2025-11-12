import { useState, useRef } from "react";
import CropModal from "../../utils/CropModal";

export default function SelectImage({ setInputs }) {
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef();

  // 파일 선택 시 호출되는 함수
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    // 파일 읽기가 완료되면 실행
    reader.onloadend = () => {
      setImageSrc(reader.result); // 이미지 데이터 URL을 상태에 저장하여 CropModal에 전달
    };
    reader.readAsDataURL(file); // 파일을 DataURL 형태로 읽기 시작
  };

  const handleCropComplete = (croppedDataUrl) => {
    setInputs((prev) => ({
      ...prev,
      imageUrl: croppedDataUrl,
    }));
    setImageSrc(null); // 모달 닫기
  };

  return (
    <>
      {/* 이미지 파일 선택 */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
      />

      {/* 이미지가 선택되어 있으면 표시 */}
      {imageSrc && (
        <CropModal
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
