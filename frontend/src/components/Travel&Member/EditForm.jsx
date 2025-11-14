import { useState, Children, cloneElement } from "react";
import { apiPatch } from "../../api/fetch";
import { useToast } from "../common/Toast";
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
  const [editValues, setEditValues] = useState({ ...data });
  const { success, error: showError } = useToast();

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

  const handleUpdate = async () => {
    if (!empty(editValues)) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      await apiPatch(endpoint, data.id, editValues);
      success(MESSAGES.UPDATE_SUCCESS);
      onDone(editValues);
    } catch (err) {
      showError(err.message || MESSAGES.UPDATE_FAIL);
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
