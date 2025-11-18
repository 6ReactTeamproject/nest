/**
 * 이미지 크롭 모달 컴포넌트
 * 사용자가 이미지를 크롭할 수 있는 모달입니다.
 * 
 * 왜 필요한가?
 * - 이미지 크롭 기능: 사용자가 원하는 영역만 선택하여 이미지 크기 최적화
 * - 사용자 경험 향상: 업로드 전에 이미지를 편집할 수 있게 함
 * - 다양한 형태 지원: 정사각형, 원형 등 다양한 형태로 크롭 가능
 * - 줌 기능: 이미지를 확대/축소하여 정확한 영역 선택
 */

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";
import "../styles/CropModal.css";

export default function CropModal({ imageSrc, onClose, onCropComplete, Shape }) {
  // 사용자가 이동한 자르기 위치 (x, y 좌표)
  // 왜 필요한가? 사용자가 이미지를 드래그하여 크롭 영역을 이동할 수 있게 함
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  // 줌 레벨: 이미지 확대/축소 정도
  // 왜 필요한가? 작은 이미지나 세밀한 영역 선택을 위해 줌 기능 제공
  const [zoom, setZoom] = useState(1);
  // 최종 자르기 영역 좌표 저장
  // 왜 필요한가? 실제 이미지를 자를 때 사용할 픽셀 좌표를 저장하기 위해
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // 자르기 비율 설정
  // Shape가 round일 경우 1:1 비율 (정사각형/원형), 그렇지 않으면 기본값 4:3
  // 왜 비율을 설정하나? 일관된 이미지 크기를 유지하기 위해
  const [aspect, setAspect] = useState(Shape === 'round' ? 1 / 1 : 4 / 3);

  /**
   * 자르기 완료 콜백 함수
   * 사용자가 크롭 영역을 조정할 때마다 호출됩니다.
   * 
   * 왜 필요한가?
   * - 좌표 저장: 크롭 영역의 픽셀 좌표를 저장하여 실제 이미지 자르기에 사용
   * - useCallback 사용: 불필요한 리렌더링 방지
   */
  const handleCropComplete = useCallback((_, areaPixels) => {
    // areaPixels: 크롭 영역의 픽셀 좌표 (x, y, width, height)
    setCroppedAreaPixels(areaPixels);
  }, []);

  /**
   * 저장 버튼 클릭 핸들러
   * 크롭된 이미지를 생성하고 부모 컴포넌트에 전달합니다.
   * 
   * 왜 필요한가?
   * - 이미지 생성: 저장된 좌표를 사용하여 실제로 이미지를 자름
   * - 부모에 전달: 크롭된 이미지를 부모 컴포넌트에 콜백으로 전달
   * - 모달 닫기: 크롭 완료 후 모달을 닫음
   */
  const handleSave = async () => {
    // getCroppedImg: 저장된 좌표를 사용하여 실제 이미지를 자름
    // 왜 비동기인가? 이미지 처리에 시간이 걸릴 수 있으므로
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    // 잘린 이미지를 부모에게 전달
    onCropComplete(croppedImage);
    // 모달 닫기
    onClose();
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        {/* react-easy-crop 컴포넌트 */}
        <Cropper
          image={imageSrc}              // 자를 이미지
          crop={crop}                   // 현재 자르기 위치
          zoom={zoom}                   // 현재 줌 레벨
          aspect={aspect}               // 자르기 비율
          cropShape={Shape}             // 자르기 형태 (round or square)
          showGrid={false}              // 보조선 비활성화
          onCropChange={setCrop}        // 사용자가 자르기 위치를 바꿀 때 상태 업데이트
          onZoomChange={setZoom}        // 줌 레벨 변경
          onCropComplete={handleCropComplete} // 자르기 완료 시 콜백 실행
        />
      </div>
      
      <div className="crop-controls">
        {/* 줌 슬라이더 */}
        <label style={{ color: "white" }}>
          줌:
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {/* 자르기 비율 선택 - 사각형 모드일 경우에만 표시 */}
        {Shape == 'square' && (
          <label style={{ color: "white" }}>
            비율:
            <select value={aspect} onChange={(e) => setAspect(Number(e.target.value))}>
              <option value={1}>1:1</option>
              <option value={4 / 3}>4:3</option>
              <option value={16 / 9}>16:9</option>
              <option value={3 / 4}>3:4</option>
            </select>
          </label>
        )}

        {/* 버튼 영역 */}
        <button type="button" onClick={onClose}>취소</button>
        <button type="button" onClick={handleSave}>저장</button>
      </div>
    </div>
  );
}
