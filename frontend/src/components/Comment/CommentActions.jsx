import { compareIds } from "../../utils/helpers";

const CommentActions = ({
  comment,
  currentUser,
  onEdit,
  onDelete,
}) => {
  if (!currentUser || !compareIds(currentUser.id, comment.userId))
    return null;

  return (
    <div className="comment-actions">
      {/* 수정 버튼 (댓글 수정 모드로 전환) */}
      <button onClick={() => onEdit(comment)} className="comment-edit-button">
        수정
      </button>
      {/* 삭제 버튼 (댓글 삭제 확인 후 삭제) */}
      <button
        onClick={() => onDelete(comment)}
        className="comment-delete-button"
      >
        삭제
      </button>
    </div>
  );
};

export default CommentActions;
