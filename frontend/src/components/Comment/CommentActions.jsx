// 댓글 수정/삭제 버튼 컴포넌트
const CommentActions = ({
  comment,      // 댓글 데이터
  currentUser,  // 현재 로그인한 사용자 객체
  onEdit,       // 수정 버튼
  onDelete,     // 삭제 버튼
}) => {
  // 로그인하지 않았거나, 댓글 작성자가 아니면 버튼들을 보여주지 않음
  if (!currentUser || String(currentUser.id) !== String(comment.userId))
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
