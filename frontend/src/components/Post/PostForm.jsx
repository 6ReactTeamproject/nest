/**
 * 게시글 작성/수정 폼 컴포넌트
 * 게시글을 작성하거나 수정할 때 사용하는 폼입니다.
 * 
 * 왜 필요한가?
 * - 게시글 작성/수정 UI: 사용자가 게시글을 작성하거나 수정할 수 있는 인터페이스 제공
 * - 재사용성: 작성과 수정 모두에서 동일한 컴포넌트 사용
 * - 폼 상태 관리: 제목, 내용, 이미지 등의 입력값을 관리
 * - 유효성 검사: 필수 필드 검증 후 제출
 */

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
  // React Router의 navigate 훅: 페이지 이동을 위해
  const nav = useNavigate();

  /**
   * 입력값 변경 핸들러
   * 사용자가 입력 필드를 변경할 때 호출됩니다.
   * 
   * 왜 필요한가?
   * - 제어 컴포넌트 패턴: React가 입력값을 제어하여 상태와 UI를 동기화
   * - 동적 업데이트: 입력값이 변경될 때마다 상태를 업데이트
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 스프레드 연산자로 기존 상태를 복사하고 변경된 필드만 업데이트
    // 왜 이렇게 하나? 불변성을 유지하면서 상태를 업데이트하기 위해
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 폼 제출 핸들러
   * 폼이 제출될 때 호출됩니다.
   * 
   * 왜 필요한가?
   * - 기본 동작 방지: 브라우저의 기본 폼 제출 동작을 막고 커스텀 로직 실행
   * - 유효성 검사: 필수 필드가 입력되었는지 확인
   * - 부모 컴포넌트에 제출 위임: 실제 제출 로직은 부모 컴포넌트에서 처리
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    // 필수 필드 검증: 제목과 내용이 비어있으면 제출하지 않음
    // 왜 여기서 검증하나? 사용자가 빈 폼을 제출하는 것을 방지
    if (!post.title.trim() || !post.content.trim()) {
      return; // WritePost에서 처리 (에러 메시지 표시)
    }
    // 부모 컴포넌트의 onSubmit 함수 호출
    // 왜 부모에게 위임하나? 실제 API 호출은 부모 컴포넌트에서 처리하므로
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
        {/* 취소 버튼 이전 페이지로 이동 */}
        <button type="button" onClick={() => nav(-1)} className="post-form-cancel-button">
          취소
        </button>
        {/* 제출 버튼 "수정", 없으면 "작성" */}
        <button type="submit" className="post-form-submit-button" disabled={isLoading}>
          {isLoading ? MESSAGES.LOADING : (id ? "수정" : "작성")}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
