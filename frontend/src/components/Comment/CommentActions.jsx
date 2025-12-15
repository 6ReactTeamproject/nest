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
      <button onClick={() => onEdit(comment)} className="comment-edit-button">
        수정
      </button>
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
