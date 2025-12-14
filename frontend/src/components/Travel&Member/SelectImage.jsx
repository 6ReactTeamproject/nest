import { useState, useRef, useEffect } from "react";
import CropModal from "../../utils/CropModal";
import { apiUploadImage } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { API_BASE_URL } from "../../constants";

export default function SelectImage({ setInputs, initialImage = null }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(() => {
    if (initialImage) {
      return initialImage.startsWith('http') 
        ? initialImage 
        : `${API_BASE_URL}${initialImage}`;
    }
    return null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const { error: showError } = useToast();

  // initialImage가 변경될 때 preview 업데이트
  useEffect(() => {
    if (initialImage) {
      const fullImageUrl = initialImage.startsWith('http') 
        ? initialImage 
        : `${API_BASE_URL}${initialImage}`;
      setPreview(fullImageUrl);
    } else if (initialImage === "") {
      setPreview(null);
    }
  }, [initialImage]);

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

  const handleCropComplete = async (croppedDataUrl) => {
    try {
      setIsUploading(true);
      
      // 크롭된 이미지를 서버에 업로드
      const imagePath = await apiUploadImage(croppedDataUrl);
      
      // 업로드된 이미지 경로로 미리보기 설정
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${API_BASE_URL}${imagePath}`;
      
      setPreview(fullImageUrl);
      
      // 부모 컴포넌트에 업로드된 이미지 경로 전달
      setInputs((prev) => ({
        ...prev,
        imageUrl: imagePath,
      }));
      
      setImageSrc(null); // 모달 닫기
    } catch (err) {
      showError(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setPreview(null);
    setInputs((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  return (
    <>
      {/* 이미지 파일 선택 버튼 */}
      <div style={{ marginBottom: "10px" }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "업로드 중..." : "이미지 선택"}
        </button>
        
        {/* 이미지 제거 버튼 */}
        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            이미지 제거
          </button>
        )}
      </div>

      {/* 숨겨진 파일 input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {/* 이미지 미리보기 */}
      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={preview}
            alt="미리보기"
            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px" }}
          />
        </div>
      )}

      {/* 이미지가 선택되어 있으면 크롭 모달 표시 */}
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
