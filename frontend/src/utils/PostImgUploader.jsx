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

import React, { useRef, useState } from "react";
import CropModal from "./CropModal";
import "../styles/PostImgUploader.css";

export default function PostImgUploader({ onChangeImage, Shape = "square" }) {
  // 최종적으로 보여줄 이미지 미리보기 (크롭된 이미지)
  // 왜 필요한가? 사용자가 선택한 이미지를 미리 확인할 수 있게 함
  const [preview, setPreview] = useState(null);
  // 원본 이미지 (크롭 모달에 표시할 이미지)
  // 왜 필요한가? 크롭 모달에서 원본 이미지를 표시하고 크롭 영역을 선택하기 위해
  const [imageSrc, setImageSrc] = useState(null);
  // 숨겨진 파일 input을 트리거하기 위한 ref
  // 왜 필요한가? 커스텀 버튼을 클릭했을 때 파일 선택 다이얼로그를 열기 위해
  const fileInputRef = useRef();

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
   * 
   * 왜 필요한가?
   * - 크롭된 이미지 저장: 크롭된 이미지를 미리보기로 설정
   * - 부모 컴포넌트에 전달: 크롭된 이미지를 부모 컴포넌트에 콜백으로 전달
   * - 모달 닫기: 크롭 완료 후 모달을 닫음
   */
  const handleCropComplete = (cropped) => {
    setPreview(cropped); // 자른 이미지 미리보기로 설정
    if (onChangeImage) {
      // 부모 컴포넌트에 콜백으로 전달
      // 왜 콜백을 사용하나? 부모 컴포넌트가 크롭된 이미지를 받아서 처리하기 위해
      onChangeImage(cropped);
    }
    setImageSrc(null); // 모달 닫기 (imageSrc가 null이면 모달이 닫힘)
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
