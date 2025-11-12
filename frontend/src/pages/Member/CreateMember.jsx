import CreateButton from "../../components/Travel&Member/CreateButton";
import PostImgUploader from "../../utils/PostImgUploader.jsx";

export default function CreateMember() {
  // 입력 필드가 모두 채워졌는지 확인하는 유효성 검사 함수
  const isFilled = (data) =>
    data.name?.trim() && data.introduction?.trim();

  return (
    // 공통 컴포넌트인 CreateButton을 사용하여 멤버 생성 폼을 구성
    <CreateButton
      endpoint="members"    // POST 요청을 보낼 API 엔드포인트
      redirect="/team"      // 작성 완료 후 이동할 경로
      empty={isFilled}      // 유효성 검사를 위한 함수 전달
    >
      {/* 이름 입력 필드 */}
      <input name="name" placeholder="이름" />
      {/* 조원 소개 입력 필드 */}
      <textarea name="introduction" placeholder="조원 소개" />
      {/* 이미지 업로드 컴포넌트 */}
      <PostImgUploader />
    </CreateButton>
  );
}
