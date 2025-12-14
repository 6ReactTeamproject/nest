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
    // SelectImage 컴포넌트인 경우 initialImage 전달
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
      // DTO에 허용된 필드만 추출하여 전송
      // 왜 필요한가? 백엔드 ValidationPipe가 forbidNonWhitelisted: true로 설정되어 있어서
      // DTO에 없는 필드(id, user_id, user 등)가 있으면 400 에러 발생
      const allowedFields = ['name', 'introduction', 'imageUrl', 'title', 'description'];
      const updateData = {};
      
      // 허용된 필드만 추출
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

      {/* 이미지 미리보기는 SelectImage 컴포넌트 내부에서 처리 */}

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
