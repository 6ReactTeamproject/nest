import React, { useRef, useState, useEffect } from "react";
import CropModal from "./CropModal";
import { apiUploadImage } from "../api/fetch";
import { useToast } from "../components/common/Toast";
import { API_BASE_URL } from "../constants";
import "../styles/PostImgUploader.css";

export default function PostImgUploader({ onChangeImage, Shape = "square", initialImage = null, setInputs = null }) {
  const [preview, setPreview] = useState(() => {
    if (initialImage) {
      return initialImage.startsWith('http') 
        ? initialImage 
        : `${API_BASE_URL}${initialImage}`;
    }
    return null;
  });
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (cropped) => {
    try {
      setIsUploading(true);
      
      const imagePath = await apiUploadImage(cropped);
      
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${API_BASE_URL}${imagePath}`;
      
      setPreview(fullImageUrl);
      
      if (onChangeImage) {
        onChangeImage(imagePath);
      } else if (setInputs) {
        setInputs((prev) => ({
          ...prev,
          imageUrl: imagePath,
        }));
      }
      
      setImageSrc(null);
    } catch (err) {
      showError(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (onChangeImage) {
      onChangeImage("");
    } else if (setInputs) {
      setInputs((prev) => ({
        ...prev,
        imageUrl: "",
      }));
    }
  };

  return (
    <>
      <button
        type="button"
        className="image-upload-button"
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
      >
        {isUploading ? "업로드 중..." : "이미지 선택"}
      </button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      <div className="post-image-uploader">
        {preview ? (
          <div className="image-preview-container">
            <img src={preview} alt="게시글 이미지" className="post-detail-image" />
            <button
              type="button"
              className="image-remove-button"
              onClick={handleRemoveImage}
              title="이미지 제거"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="placeholder-image">선택된 이미지가 없습니다</div>
        )}
      </div>

      {imageSrc && (
        <CropModal
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onCropComplete={handleCropComplete}
          Shape={Shape}
        />
      )}
    </>
  );
}
