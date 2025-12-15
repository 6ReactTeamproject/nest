import React from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../common/FormInput";
import FormTextarea from "../common/FormTextarea";
import FormButton from "../common/FormButton";
import PostImgUploader from "../../utils/PostImgUploader";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";
import "../../styles/post.css";

const PostForm = ({ post, setPost, onSubmit, id, isLoading = false }) => {
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!post.title.trim() || !post.content.trim()) {
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <FormInput
        name="title"
        value={post.title}
        onChange={handleChange}
        placeholder="제목을 입력하세요"
        className="post-form-input"
      />
      <FormTextarea
        name="content"
        value={post.content}
        onChange={handleChange}
        placeholder="내용을 입력하세요"
        className="post-form-textarea"
      />
      <div className="post-form-image">
        <PostImgUploader
          initialImage={post.image || null}
          onChangeImage={(img) => {
            setPost((prev) => ({ ...prev, image: img }));
          }}
        />
      </div>
      <div className="post-form-buttons">
        <button type="button" onClick={() => nav(-1)} className="post-form-cancel-button">
          취소
        </button>
        <button type="submit" className="post-form-submit-button" disabled={isLoading}>
          {isLoading ? MESSAGES.LOADING : (id ? "수정" : "작성")}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
