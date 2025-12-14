import { useState, Children, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api/fetch";
import { useToast } from "../common/Toast";
import FormButton from "../common/FormButton";
import { MESSAGES, API_BASE_URL } from "../../constants";
import "../../styles/form.css";

export default function CreateButton({
  endpoint,
  redirect,
  empty,
  children,
}) {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const { success, error: showError } = useToast();

  const handleSubmit = async () => {
    if (!empty(inputs)) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      // DTO에 허용된 필드만 추출하여 전송
      // 왜 필요한가? 백엔드 ValidationPipe가 forbidNonWhitelisted: true로 설정되어 있어서
      // DTO에 없는 필드가 있으면 400 에러 발생
      const allowedFields = {
        'members': ['name', 'introduction', 'imageUrl'],
        'semester': ['title', 'description', 'imageUrl'],
      };
      
      const fields = allowedFields[endpoint] || Object.keys(inputs);
      const submitData = {};
      
      // 허용된 필드만 추출
      fields.forEach(field => {
        if (inputs.hasOwnProperty(field)) {
          submitData[field] = inputs[field];
        }
      });
      
      await apiPost(endpoint, submitData);
      success(MESSAGES.CREATE_SUCCESS);
      navigate(redirect);
    } catch (err) {
      showError(err.message || MESSAGES.CREATE_FAIL);
    }
  };

  // 자식 컴포넌트들에 value와 onChange를 props로 주입하여 상태관리와 연동
  const enhancedChildren = Children.map(children, (child) => {
    // PostImgUploader나 SelectImage 같은 커스텀 컴포넌트에는 setInputs 전달
    // name이 없는 컴포넌트에는 setInputs만 주입 (ex: 커스텀 컴포넌트)
    if (!child?.props?.name) return cloneElement(child, { setInputs });

    // name이 있는 인풋 컴포넌트 value, onChange 주입
    return cloneElement(child, {
      value: inputs[child.props.name] || "",
      onChange: (e) =>
        setInputs((prev) => ({
          ...prev,
          [child.props.name]: e.target.value,
        })),
    });
  });

  return (
    <div className="form-container">
      {enhancedChildren}

      {/* 이미지 URL이 있을 경우 미리보기 표시 */}
      {inputs.imageUrl && (
        <img
          src={inputs.imageUrl.startsWith('http') ? inputs.imageUrl : `${API_BASE_URL}${inputs.imageUrl}`}
          alt="미리보기"
          style={{ maxWidth: "100%", marginTop: "10px" }}
        />
      )}

      <div className="button-group">
        <FormButton onClick={handleSubmit} className="add-button">
          등록
        </FormButton>
        <FormButton
          onClick={() => navigate(redirect)}
          className="cancel-button"
        >
          취소
        </FormButton>
      </div>
    </div>
  );
}
