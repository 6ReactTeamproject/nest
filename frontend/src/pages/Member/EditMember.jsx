import EditForm from "../../components/Travel&Member/EditForm";
import SelectImage from "../../components/Travel&Member/SelectImage";

export default function EditMember({ member, onDone }) {
  // 모든 필드가 비어 있지 않은지 확인하는 유효성 검사 함수
  const isFilled = (data) =>
    data.name?.trim() && data.introduction?.trim();

  return (
    <EditForm
      endpoint="members"       // 수정할 리소스의 API 엔드포인트
      empty={isFilled}         // 유효성 검사 함수 전달
      data={member}            // 초기 데이터 (수정 대상 멤버 정보)
      onDone={onDone}          // 수정 완료 후 콜백 처리
    >
      {/* 수정할 이름 입력 필드 */}
      <input name="name" placeholder="이름" />

      {/* 소개 입력 필드 */}
      <textarea name="introduction" placeholder="소개" />

      {/* 이미지 선택 컴포넌트 */}
      <SelectImage />
    </EditForm>
  );
}
