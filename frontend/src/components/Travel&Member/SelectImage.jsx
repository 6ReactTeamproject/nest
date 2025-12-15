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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl) => {
    try {
      setIsUploading(true);
      
      const imagePath = await apiUploadImage(croppedDataUrl);
      
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${API_BASE_URL}${imagePath}`;
      
      setPreview(fullImageUrl);
      
      setInputs((prev) => ({
        ...prev,
        imageUrl: imagePath,
      }));
      
      setImageSrc(null);
    } catch (err) {
      showError(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setInputs((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  return (
    <>
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

      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={preview}
            alt="미리보기"
            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px" }}
          />
        </div>
      )}

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
