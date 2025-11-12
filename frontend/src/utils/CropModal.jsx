import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";
import "../styles/CropModal.css";

export default function CropModal({ imageSrc, onClose, onCropComplete, Shape }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // 사용자가 이동한 자르기 위치
  const [zoom, setZoom] = useState(1); // 줌
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // 최종 자르기 영역 좌표 저장

  // Shape 가 round 일 경우 1:1 비율, 그렇지 않으면 기본값 4:3
  const [aspect, setAspect] = useState(Shape === 'round' ? 1 / 1 : 4 / 3);

  // 자르기 완료 시 해당 영역 좌표를 저장하는 콜백 함수
  const handleCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // 저장 버튼 클릭 시 잘린 이미지를 생성하고 상위 컴포넌트에 전달
  const handleSave = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage); // 잘린 이미지를 부모에게 전달
    onClose(); // 모달 닫기
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
