import EditForm from "../../components/Travel&Member/EditForm";
import SelectImage from "../../components/Travel&Member/SelectImage";

export default function EditMember({ member, onDone }) {
  const isFilled = (data) =>
    data.name?.trim() && data.introduction?.trim();

  return (
    <EditForm
      endpoint="members"
      empty={isFilled}
      data={member}
      onDone={onDone}
    >
      <input name="name" placeholder="이름" />

      <textarea name="introduction" placeholder="소개" />

      <SelectImage />
    </EditForm>
  );
}
