import CreateButton from "../../components/Travel&Member/CreateButton";
import PostImgUploader from "../../utils/PostImgUploader.jsx";

export default function CreateTravelIntro() {
  // 모든 필드가 입력되었는지 확인하는 유효성 검사 함수
  const isFilled = (data) =>
    data.title?.trim() && data.description?.trim();

  return (
    // 공통 컴포넌트인 CreateButton을 활용하여 장소 생성 폼 구성
    <CreateButton
      endpoint="semester"     // 저장할 API 엔드포인트
      redirect="/intro"       // 저장 완료 후 이동할 경로
      empty={isFilled}        // 입력값 유효성 검사 함수 전달
    >
      {/* 제목 입력 필드 */}
      <input name="title" placeholder="현지학기제 장소" />

      {/* 장소 설명 입력 필드 */}
      <textarea name="description" placeholder="현지학기제 소개" />

      {/* 이미지 업로더 컴포넌트 */}
      <PostImgUploader />
    </CreateButton>
  );
}
