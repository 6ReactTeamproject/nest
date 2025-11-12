import React, { useRef, useState } from "react";
import { useUser } from "../../hooks/UserContext";
import "../../styles/UploadImg.css"
import CropModal from "../../utils/CropModal";

export default function UploadImg({ shape = "round" }) {
  const { user, setUser } = useUser(); // 로그인 사용자 정보와 업데이트 함수
  const [preview, setPreview] = useState(user.image); // 현재 프로필 이미지 미리보기
  const [imageSrc, setImageSrc] = useState(null); // 자르기 모달에 전달할 이미지 소스
  const fileInputRef = useRef(); // 숨겨진 input 요소를 제어하기 위한 ref

  // 이미지 선택 시 실행되는 함수
  const handleImageChange = async (e) => {
    const file = e.target.files[0]; // 첫 번째 파일만 사용
    if (!file) return;

    const reader = new FileReader();
    // 파일 로딩 완료 시 base64 데이터로 모달 열기
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 자르기 완료 후 이미지 저장 및 미리보기 반영
  const handleCropComplete = async (croppedImage) => {
    const res = await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: croppedImage }),
    });

    if (res.ok) {
      const updatedUser = { ...user, image: croppedImage };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // 로컬 저장소에 업데이트
      setUser(updatedUser); // context 상태도 업데이트
      setPreview(croppedImage); // 새로운 이미지로 미리보기 갱신
    } else {
      alert("이미지 저장 실패");
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
