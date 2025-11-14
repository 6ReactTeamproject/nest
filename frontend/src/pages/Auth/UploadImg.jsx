import React, { useRef, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { apiPatch } from "../../api/fetch";
import "../../styles/UploadImg.css"
import CropModal from "../../utils/CropModal";

export default function UploadImg({ shape = "round" }) {
  const { user, setUser } = useUser();
  const [preview, setPreview] = useState(user?.image);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef();
  const { success, error: showError } = useToast();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage) => {
    try {
      await apiPatch("user", user.id, { image: croppedImage });
      const newUser = { ...user, image: croppedImage };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setPreview(croppedImage);
      success("프로필 이미지가 변경되었습니다.");
    } catch (err) {
      showError(err.message || "이미지 저장 실패");
    }
  };

  return (
    <>
      {/* 이미지 업로드 UI */}
      <div
        className="upload-img-wrapper"
        onClick={() => fileInputRef.current.click()} // 이미지를 클릭하면 파일 입력창 열기
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }} // 기본 input은 숨김
        />
        <img src={preview} alt="프로필" className="profile-img" />
        <div className="edit-overlay">
          <img
            src="https://img.icons8.com/?size=100&id=11612&format=png&color=ffffff"
            alt="수정 아이콘"
            className="edit-icon-img"
          />
        </div>
      </div>

      {/* 이미지 자르기 모달 */}
      {imageSrc && (
        <CropModal
          imageSrc={imageSrc} // 원본 이미지 소스
          onClose={() => setImageSrc(null)} // 모달 닫기 함수
          onCropComplete={handleCropComplete} // 자르기 완료 시 실행될 함수
          Shape={shape} // 자르기 모양 ('round' 또는 'square')
        />
      )}
    </>
  );
}
