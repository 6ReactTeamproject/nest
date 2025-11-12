import React, { useRef, useState } from "react";
import CropModal from "./CropModal";
import "../styles/PostImgUploader.css";

export default function PostImgUploader({ onChangeImage, Shape = "square" }) {
  const [preview, setPreview] = useState(null); // 최종적으로 보여줄 이미지 미리보기
  const [imageSrc, setImageSrc] = useState(null); // 원본 이미지 (크롭 모달용)
  const fileInputRef = useRef(); // 숨겨진 파일 input을 트리거하기 위한 ref

  // 사용자가 파일을 선택했을 때 실행되는 함수
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // 파일 객체 가져오기
    if (!file) return;

    // 파일을 base64 형식으로 변환하여 imageSrc에 저장 (크롭 모달에 사용)
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 자르기 완료 후 호출되는 함수 (크롭된 이미지를 부모로 전달하고 미리보기로 표시)
  const handleCropComplete = (cropped) => {
    setPreview(cropped); // 자른 이미지 미리보기로 설정
    if (onChangeImage) {
      onChangeImage(cropped); // 부모 컴포넌트에 콜백으로 전달
    }
    setImageSrc(null); // 모달 닫기
  };

  return (
    <>
      {/* 이미지 업로드 버튼 */}
      <button
        type="button"
        className="image-upload-button"
        onClick={() => fileInputRef.current.click()} // 숨겨진 input을 클릭하도록 트리거
      >
        이미지 선택
      </button>

      {/* 실제 파일 input (숨겨져 있음) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {/* 이미지 미리보기 영역 */}
      <div className="post-image-uploader">
        {preview ? (
          <img src={preview} alt="게시글 이미지" className="post-detail-image" />
        ) : (
          <div className="placeholder-image">선택된 이미지가 없습니다</div>
        )}
      </div>

      {/* 이미지 자르기 모달 (이미지 선택 시) */}
      {imageSrc && (
        <CropModal
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)} // 모달 닫기
          onCropComplete={handleCropComplete} // 크롭 완료 시 실행될 콜백
          Shape={Shape} // 외부에서 설정한 자르기 모양
        />
      )}
    </>
  );
}
