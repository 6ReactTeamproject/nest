import React from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../common/FormInput";
import FormTextarea from "../common/FormTextarea";
import FormButton from "../common/FormButton";
import PostImgUploader from "../../utils/PostImgUploader";
import { MESSAGES } from "../../constants";
import "../../styles/form.css";
import "../../styles/post.css";

const PostForm = ({ post, setPost, onSubmit, id }) => {
  const nav = useNavigate();

  // 입력값 변경 처리 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 제목 입력 확인
    if (!post.title.trim()) {
      alert(MESSAGES.REQUIRED_FIELD);
      return;
    }
    // 내용 입력 확인
    if (!post.content.trim()) {
      alert(MESSAGES.REQUIRED_FIELD);
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
          onChangeImage={(img) => {
            setPost((prev) => ({ ...prev, image: img }));
          }}
        />
      </div>
      <div className="post-form-buttons">
        {/* 취소 버튼 이전 페이지로 이동 */}
        <button type="button" onClick={() => nav(-1)} className="post-form-cancel-button">
          취소
        </button>
        {/* 제출 버튼 "수정", 없으면 "작성" */}
        <button type="submit" className="post-form-submit-button">
          {id ? "수정" : "작성"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
