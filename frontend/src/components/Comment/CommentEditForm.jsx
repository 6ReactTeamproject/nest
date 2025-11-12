// 댓글 수정 컴포넌트
import { useState } from "react";

// comment: 수정 중인 댓글
// onSave: 저장 버튼 클릭 시 호출
// onCancel: 취소 버튼 클릭 시 호출
function CommentEditForm({ comment, onSave, onCancel }) {
  // 수정할 텍스트 상태
  const [editingText, setEditingText] = useState(comment.text);

  return (
    <div className="comment-edit-form">
      {/* 수정할 텍스트 입력창 (기존 텍스트가 미리 입력되어 있음) */}
      <input
        className="comment-edit-input"
        value={editingText}
        onChange={(e) => setEditingText(e.target.value)} // 입력값 상태 업데이트
      />
      <div className="comment-edit-buttons">
        {/* 저장 버튼 */}
        <button
          className="comment-save-button"
          onClick={() => onSave(editingText)}
        >
          저장
        </button>
        {/* 취소 버튼 */}
        <button className="comment-cancel-button" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}

export default CommentEditForm;
