import { useState } from "react";
import { apiPost } from "../../api/fetch";
import { useToast } from "../common/Toast";
import FormInput from "../common/FormInput";
import FormButton from "../common/FormButton";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";

function CommentForm({
  currentUser,
  id,
  setComments,
  onCancel,
  parentId,
}) {
  const [values, setValues] = useState({ text: "" });
  const { success, error: showError } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setValues({ text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.text.trim()) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      const newComment = await apiPost("comments", {
        text: values.text,
        postId: id,
        parentId: parentId || null,
      });
      
      setComments((prev) => [...prev, newComment]);
      
      reset();
      success(MESSAGES.COMMENT_CREATE_SUCCESS);
      
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      showError(err.message || MESSAGES.COMMENT_CREATE_FAIL);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <FormInput
        name="text"
        value={values.text}
        onChange={handleChange}
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
        className="form-input"
      />
      <div className="button-group">
        <FormButton type="submit" className="add-button">
          {parentId ? "답글 작성" : "댓글 작성"}
        </FormButton>
        {onCancel && (
          <FormButton
            type="button"
            onClick={onCancel}
            className="cancel-button"
          >
            취소
          </FormButton>
        )}
      </div>
    </form>
  );
}

export default CommentForm;
