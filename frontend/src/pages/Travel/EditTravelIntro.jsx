import EditForm from "../../components/Travel&Member/EditForm";
import SelectImage from "../../components/Travel&Member/SelectImage";

export default function EditTravelIntro({ travelPlace, onDone }) {
  // 모든 필드가 입력되었는지 확인하는 함수
  const isFilled = (data) =>
    data.title?.trim() && data.description?.trim();

  return (
    // 공통 수정 폼 컴포넌트에 데이터 전달
    <EditForm
      endpoint="semester"      // 수정할 API 경로
      empty={isFilled}         // 입력 필드 유효성 검사 함수
      data={travelPlace}       // 기존 장소 정보
      onDone={onDone}          // 수정 완료 시 실행할 콜백 함수
    >
      {/* 장소명 입력 필드 */}
      <input name="title" placeholder="장소명" />
      {/* 장소 설명 입력 필드 */}
      <textarea name="description" placeholder="장소 소개" />
      {/* 이미지 선택 컴포넌트 */}
      <SelectImage />
    </EditForm>
  );
}
