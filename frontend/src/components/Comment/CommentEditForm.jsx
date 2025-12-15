import { useState } from "react";

function CommentEditForm({ comment, onSave, onCancel }) {
  const [editingText, setEditingText] = useState(comment.text);

  return (
    <div className="comment-edit-form">
      <input
        className="comment-edit-input"
        value={editingText}
        onChange={(e) => setEditingText(e.target.value)}
      />
      <div className="comment-edit-buttons">
        <button
          className="comment-save-button"
          onClick={() => onSave(editingText)}
        >
          저장
        </button>
        <button className="comment-cancel-button" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}

export default CommentEditForm;
