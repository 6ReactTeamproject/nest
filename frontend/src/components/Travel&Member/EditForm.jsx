import { useState, Children, cloneElement } from "react";
import { apiPatch } from "../../api/fetch";
import { useToast } from "../common/Toast";
import FormButton from "../common/FormButton";
import { MESSAGES, API_BASE_URL } from "../../constants";
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
    if (child?.type?.name === 'SelectImage' || child?.type?.displayName === 'SelectImage') {
      return cloneElement(child, {
        setInputs: setEditValues,
        initialImage: editValues.imageUrl || null,
      });
    }
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
      const allowedFields = ['name', 'introduction', 'imageUrl', 'title', 'description'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (editValues.hasOwnProperty(field)) {
          updateData[field] = editValues[field];
        }
      });
      
      await apiPatch(endpoint, data.id, updateData);
      success(MESSAGES.UPDATE_SUCCESS);
      onDone(editValues);
    } catch (err) {
      showError(err.message || MESSAGES.UPDATE_FAIL);
    }
  };

  return (
    <div className="form-container">
      {enhancedChildren}

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
