import { useState, Children, cloneElement } from "react";
import { apiPatch } from "../../api/fetch";
import FormButton from "../common/FormButton";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";

export default function EditForm({
  endpoint,
  empty,
  children,
  data,
  onDone
}) {
    // 초기 데이터를 상태로 관리
  const [editValues, setEditValues] = useState({ ...data });

  const enhancedChildren = Children.map(children, (child) => {
    if (!child?.props?.name) {
      return cloneElement(child, { setInputs: setEditValues });
    }
    return cloneElement(child, {
      value: editValues[child.props.name] || "",
      onChange: (e) =>
        setEditValues((prev) => ({
          ...prev,
          [child.props.name]: e.target.value,
        })),
    });
  });

  // 저장 버튼 클릭 시
  const handleUpdate = async () => {
    // 빈 필드가 있으면 알림
    if (!empty(editValues)) {
      alert(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      await apiPatch(endpoint, data.id, editValues);
      alert(MESSAGES.UPDATE_SUCCESS);
      // 완료 콜백 호출
      onDone(editValues);
    } catch (err) {
      alert(MESSAGES.UPDATE_FAIL);
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      {enhancedChildren}

      {/* 이미지 미리보기 */}
      {editValues.imageUrl && (
        <img
          src={editValues.imageUrl}
          alt="미리보기"
          style={{ maxWidth: "100%", marginTop: "10px" }}
        />
      )}

      {/* 저장 / 취소 버튼 그룹 */}
      <div className="button-group">
        <FormButton onClick={handleUpdate} className="add-button">
          💾 저장
        </FormButton>
        <FormButton onClick={() => onDone(data)} className="cancel-button">
          ❌ 취소
        </FormButton>
      </div>
    </div>
  );
}
