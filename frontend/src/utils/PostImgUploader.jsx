/**
 * 게시글 이미지 업로더 컴포넌트
 * 사용자가 이미지를 선택하고 크롭할 수 있는 컴포넌트입니다.
 * 
 * 왜 필요한가?
 * - 이미지 업로드 기능: 게시글에 이미지를 첨부할 수 있게 함
 * - 이미지 크롭 기능: 사용자가 원하는 영역만 선택하여 업로드
 * - 미리보기 기능: 업로드할 이미지를 미리 확인
 * - 재사용성: 여러 곳에서 사용할 수 있는 공통 컴포넌트
 */

import React, { useRef, useState, useEffect } from "react";
import CropModal from "./CropModal";
import { apiUploadImage } from "../api/fetch";
import { useToast } from "../components/common/Toast";
import { API_BASE_URL } from "../constants";
import "../styles/PostImgUploader.css";

export default function PostImgUploader({ onChangeImage, Shape = "square", initialImage = null }) {
  // 최종적으로 보여줄 이미지 미리보기 (업로드된 이미지 경로 또는 base64)
  // 왜 필요한가? 사용자가 선택한 이미지를 미리 확인할 수 있게 함
  const [preview, setPreview] = useState(() => {
    // 초기 이미지가 있으면 표시
    if (initialImage) {
      return initialImage.startsWith('http') 
        ? initialImage 
        : `${API_BASE_URL}${initialImage}`;
    }
    return null;
  });
  // 원본 이미지 (크롭 모달에 표시할 이미지)
  // 왜 필요한가? 크롭 모달에서 원본 이미지를 표시하고 크롭 영역을 선택하기 위해
  const [imageSrc, setImageSrc] = useState(null);
  // 숨겨진 파일 input을 트리거하기 위한 ref
  // 왜 필요한가? 커스텀 버튼을 클릭했을 때 파일 선택 다이얼로그를 열기 위해
  const fileInputRef = useRef();
  // 업로드 중 상태
  const [isUploading, setIsUploading] = useState(false);
  // Toast 알림 함수
  const { error: showError } = useToast();

  // initialImage가 변경될 때 preview 업데이트
  // 왜 필요한가? 게시글 수정 시 기존 이미지를 표시하기 위해
  useEffect(() => {
    if (initialImage) {
      const fullImageUrl = initialImage.startsWith('http') 
        ? initialImage 
        : `${API_BASE_URL}${initialImage}`;
      setPreview(fullImageUrl);
    } else if (initialImage === "") {
      // initialImage가 빈 문자열이면 이미지 제거
      setPreview(null);
    }
  }, [initialImage]);

  /**
   * 파일 선택 핸들러
   * 사용자가 파일을 선택했을 때 실행됩니다.
   * 
   * 왜 필요한가?
   * - 파일 읽기: 선택한 파일을 읽어서 base64로 변환
   * - 크롭 모달 열기: 변환된 이미지를 크롭 모달에 전달
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // 파일 객체 가져오기
    if (!file) return; // 파일이 없으면 종료

    // 파일을 base64 형식으로 변환하여 imageSrc에 저장 (크롭 모달에 사용)
    // FileReader: 브라우저에서 파일을 읽는 API
    // 왜 base64로 변환하나? 이미지를 문자열로 변환하여 크롭 모달에 전달하기 위해
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result); // base64 문자열로 변환된 이미지
    };
    reader.readAsDataURL(file); // 파일을 base64 데이터 URL로 읽기
  };

  /**
   * 크롭 완료 핸들러
   * 사용자가 이미지 크롭을 완료했을 때 실행됩니다.
   * 크롭된 이미지를 서버에 업로드하고 경로를 받아옵니다.
   * 
   * 왜 필요한가?
   * - 이미지 업로드: 크롭된 이미지를 서버에 업로드
   * - 경로 저장: 업로드된 이미지의 경로를 부모 컴포넌트에 전달
   * - 미리보기: 업로드된 이미지를 미리보기로 표시
   * - 모달 닫기: 크롭 완료 후 모달을 닫음
   */
  const handleCropComplete = async (cropped) => {
    try {
      setIsUploading(true);
      
      // 크롭된 이미지를 서버에 업로드
      // 왜 업로드하나? base64 문자열을 DB에 저장하는 대신 파일로 저장하여 효율성 향상
      const imagePath = await apiUploadImage(cropped);
      
      // 업로드된 이미지 경로로 미리보기 설정
      // 외부 URL인 경우 그대로 사용, 로컬 경로인 경우 백엔드 URL과 결합
      // 왜 백엔드 URL을 사용하나? 정적 파일이 백엔드에서 서빙되므로
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${API_BASE_URL}${imagePath}`;
      
      setPreview(fullImageUrl);
      
      if (onChangeImage) {
        // 부모 컴포넌트에 업로드된 이미지 경로 전달
        // 왜 경로를 전달하나? DB에 경로만 저장하면 되므로
        onChangeImage(imagePath);
      }
      
      setImageSrc(null); // 모달 닫기
    } catch (err) {
      showError(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 이미지 제거 핸들러
   * 현재 선택된 이미지를 제거합니다.
   * 
   * 왜 필요한가?
   * - 이미지 제거: 게시글 수정 시 이미지를 제거할 수 있게 함
   * - 상태 초기화: 미리보기와 부모 컴포넌트의 이미지 상태를 초기화
   */
  const handleRemoveImage = () => {
    setPreview(null);
    if (onChangeImage) {
      // 부모 컴포넌트에 빈 문자열 전달하여 이미지 제거
      onChangeImage("");
    }
  };

  return (
    <>
      {/* 이미지 업로드 버튼 */}
      <button
        type="button"
        className="image-upload-button"
        onClick={() => fileInputRef.current.click()} // 숨겨진 input을 클릭하도록 트리거
        disabled={isUploading}
      >
        {isUploading ? "업로드 중..." : "이미지 선택"}
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
          <div className="image-preview-container">
            <img src={preview} alt="게시글 이미지" className="post-detail-image" />
            {/* 이미지 제거 버튼 */}
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
