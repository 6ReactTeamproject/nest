/**
 * 댓글 작성 폼 컴포넌트
 * 게시글에 댓글을 작성할 때 사용하는 폼입니다.
 * 
 * 왜 필요한가?
 * - 댓글 작성 UI: 사용자가 댓글을 작성할 수 있는 인터페이스 제공
 * - 일반 댓글/대댓글 지원: parentId를 통해 대댓글 기능 지원
 * - 실시간 업데이트: 댓글 작성 후 목록에 즉시 반영
 * - 상태 관리: 댓글 입력값과 제출 상태를 관리
 */

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
  // 댓글 입력값 상태 관리
  // 왜 useState를 사용하나? 사용자 입력값을 추적하고 폼 제어를 위해
  const [values, setValues] = useState({ text: "" });
  // Toast 알림 함수들
  const { success, error: showError } = useToast();

  /**
   * 입력값 변경 핸들러
   * 사용자가 댓글 입력 필드를 변경할 때 호출됩니다.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 스프레드 연산자로 기존 상태를 복사하고 변경된 필드만 업데이트
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 폼 초기화 함수
   * 댓글 작성 후 입력 필드를 초기화합니다.
   * 
   * 왜 필요한가? 댓글 작성 후 입력 필드를 비워서 다음 댓글을 작성할 수 있게 함
   */
  const reset = () => {
    setValues({ text: "" });
  };

  /**
   * 댓글 제출 핸들러
   * 댓글을 서버에 전송하고 목록에 추가합니다.
   * 
   * 왜 필요한가?
   * - 댓글 생성: 백엔드 API를 호출하여 댓글을 생성
   * - 상태 업데이트: 댓글 목록에 새 댓글 추가
   * - 사용자 피드백: 성공/실패 메시지 표시
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    
    // 필수 필드 검증: 댓글 내용이 비어있으면 에러 표시
    if (!values.text.trim()) {
      showError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    try {
      // 백엔드에서 userId, createdAt, likes, likedUserIds 자동 처리
      // 왜 서버에서 처리하나? 보안상 클라이언트가 userId를 보내면 안 되므로
      const newComment = await apiPost("comments", {
        text: values.text,
        postId: id, // 게시글 ID
        parentId: parentId || null, // 대댓글인 경우 부모 댓글 ID
      });
      
      // 댓글 목록에 새 댓글 추가
      // 스프레드 연산자로 기존 댓글 목록을 복사하고 새 댓글 추가
      // 왜 이렇게 하나? 불변성을 유지하면서 상태를 업데이트하기 위해
      setComments((prev) => [...prev, newComment]);
      
      // 폼 초기화: 다음 댓글을 작성할 수 있게 함
      reset();
      success(MESSAGES.COMMENT_CREATE_SUCCESS);
      
      // 대댓글 작성 폼을 닫는 경우
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      // 에러 처리: 네트워크 오류나 서버 오류 시 에러 메시지 표시
      showError(err.message || MESSAGES.COMMENT_CREATE_FAIL);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {/* 댓글/답글 입력 필드 */}
      <FormInput
        name="text"
        value={values.text}
        onChange={handleChange}
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
        className="form-input"
      />
      {/* 버튼 영역 */}
      <div className="button-group">
        {/* 대댓글이면 "답글 작성", 일반 댓글이면 "댓글 작성" */}
        <FormButton type="submit" className="add-button">
          {parentId ? "답글 작성" : "댓글 작성"}
        </FormButton>
        {/* 취소 버튼은 답글일 때만 표시 */}
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
