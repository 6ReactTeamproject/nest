import EditForm from "../../components/Travel&Member/EditForm";
import SelectImage from "../../components/Travel&Member/SelectImage";

export default function EditTravelIntro({ travelPlace, onDone }) {
  const isFilled = (data) =>
    data.title?.trim() && data.description?.trim();

  return (
    <EditForm
      endpoint="semester"
      empty={isFilled}
      data={travelPlace}
      onDone={onDone}
    >
      <input name="title" placeholder="장소명" />
      <textarea name="description" placeholder="장소 소개" />
      <SelectImage />
    </EditForm>
  );
}
