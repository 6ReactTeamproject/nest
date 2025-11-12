import { useState, Children, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import { apiPost } from "../../api/fetch";
import FormButton from "../common/FormButton";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";

export default function CreateButton({
  endpoint,
  redirect,
  empty,
  children,
}) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [inputs, setInputs] = useState({});

  const handleSubmit = async () => {
    if (!empty(inputs)) {
      alert(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      await apiPost(endpoint, {
        ...inputs,
        authorId: user.id,
      });
      alert(MESSAGES.CREATE_SUCCESS);
      // 등록 성공 시 지정된 경로로 이동
      navigate(redirect);
    } catch (error) {
      alert(MESSAGES.CREATE_FAIL);
      console.error(error);
    }
  };

  // 자식 컴포넌트들에 value와 onChange를 props로 주입하여 상태관리와 연동
  const enhancedChildren = Children.map(children, (child) => {
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
          src={inputs.imageUrl}
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
