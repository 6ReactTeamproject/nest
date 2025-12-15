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
      const allowedFields = {
        'members': ['name', 'introduction', 'imageUrl'],
        'semester': ['title', 'description', 'imageUrl'],
      };
      
      const fields = allowedFields[endpoint] || Object.keys(inputs);
      const submitData = {};
      
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

  const enhancedChildren = Children.map(children, (child) => {
    if (!child?.props?.name) return cloneElement(child, { setInputs });

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
