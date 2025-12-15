import React, { useRef, useState, useEffect } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../../components/common/Toast";
import { apiPatch, apiUploadImage } from "../../api/fetch";
import { API_BASE_URL } from "../../constants";
import "../../styles/UploadImg.css";
import CropModal from "../../utils/CropModal";

export default function UploadImg({ shape = "round" }) {
  const { user, setUser } = useUser();
  const [preview, setPreview] = useState(() => {
    // 초기 이미지 설정: user?.image가 있으면 URL 처리
    if (user?.image) {
      return user.image.startsWith("http")
        ? user.image
        : `${API_BASE_URL}${user.image}`;
    }
    return null;
  });
  const [imageSrc, setImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef();
  const { success, error: showError } = useToast();

  // user?.image가 변경될 때 preview 업데이트
  useEffect(() => {
    if (user?.image) {
      const fullImageUrl = user.image.startsWith("http")
        ? user.image
        : `${API_BASE_URL}${user.image}`;
      setPreview(fullImageUrl);
      setImageError(false); // 이미지 변경 시 에러 상태 초기화
    } else {
      setPreview(null);
      setImageError(false);
    }
  }, [user?.image]);

  const handleFileSelect = () => {
    if (isUploading) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      showError("이미지 파일만 업로드할 수 있습니다.");
      // 파일 입력 초기화
      if (e.target) {
        e.target.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.onerror = () => {
      showError("파일을 읽는 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);

    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCropComplete = async (croppedImage) => {
    if (!user || !user.id) {
      showError("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      setImageSrc(null);
      return;
    }

    try {
      setIsUploading(true);

      // 크롭된 이미지를 서버에 업로드
      // apiUploadImage는 백엔드에서 반환한 경로를 그대로 반환 (예: /uploads/uuid-filename.jpg)
      const imagePath = await apiUploadImage(croppedImage);

      // 경로가 올바른지 확인
      if (!imagePath || typeof imagePath !== "string") {
        throw new Error("이미지 업로드 경로를 받지 못했습니다.");
      }

      // 업로드된 이미지 경로로 사용자 정보 업데이트
      // 백엔드에 저장할 때는 경로 그대로 전송 (예: /uploads/uuid-filename.jpg)
      const updatedUserData = await apiPatch("user", user.id, {
        image: imagePath,
      });

      // 백엔드에서 반환한 업데이트된 사용자 정보 사용
      // updatedUserData가 User 엔티티 전체일 수도 있고, 일부일 수도 있음
      const finalImagePath = updatedUserData?.image || imagePath;

      // 업데이트된 사용자 정보로 상태 업데이트
      const newUser = {
        ...user,
        image: finalImagePath, // 경로 그대로 저장 (예: /uploads/uuid-filename.jpg)
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      // preview 업데이트 (표시용으로는 전체 URL 사용)
      // 경로가 http로 시작하면 그대로 사용, 아니면 API_BASE_URL과 결합
      const fullImageUrl = finalImagePath.startsWith("http")
        ? finalImagePath
        : `${API_BASE_URL}${finalImagePath}`;
      setPreview(fullImageUrl);
      setImageError(false);

      // 크롭 모달 닫기
      setImageSrc(null);

      success("프로필 이미지가 변경되었습니다.");
    } catch (err) {
      console.error("이미지 업로드/저장 오류:", err);
      showError(err.message || "이미지 저장 실패");
      // 에러 발생 시에도 모달은 닫기
      setImageSrc(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 이미지 업로드 UI */}
      <div className="upload-img-wrapper" style={{ position: "relative" }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />
        {preview && !imageError ? (
          <img
            src={preview}
            alt="프로필"
            className="profile-img"
            onClick={handleFileSelect}
            onError={() => setImageError(true)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div
            className="profile-img"
            onClick={handleFileSelect}
            style={{
              backgroundColor: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "48px",
              border: "3px solid #4e5bed",
              borderRadius: "70%",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            👤
          </div>
        )}
        <div
          className="edit-overlay"
          onClick={handleFileSelect}
          style={{
            opacity: isUploading ? 0.7 : undefined,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        >
          <img
            src="https://img.icons8.com/?size=100&id=11612&format=png&color=ffffff"
            alt="수정 아이콘"
            className="edit-icon-img"
          />
        </div>
        {isUploading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              zIndex: 1001,
              pointerEvents: "none",
            }}
          >
            업로드 중...
          </div>
        )}
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
