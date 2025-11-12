// 좋아요 버튼 컴포넌트
function LikeButton({ comment, currentUser, onLike }) {
  // likedUserIds가 배열인지 확인 후 아니면 빈배열
  const likedUserIds = Array.isArray(comment.likedUserIds)
    ? comment.likedUserIds
    : [];

  // 현재 유저가 이미 좋아요 눌렀는지 확인 (유저가 로그인했고, likedUserIds에 유저 id가 있으면 true)
  const alreadyLiked = currentUser
    ? likedUserIds.includes(currentUser.id)
    : false;

  return (
    <button
      // 좋아요 상태에 따라 onClick 시 like 또는 unlike 처리
      onClick={() => onLike(comment, alreadyLiked)}
      // 좋아요 여부에 따라 스타일 클래스 다르게 설정
      className={`like-button ${alreadyLiked ? "liked" : ""}`}
    >
      {/* 이미 좋아요 눌렀으면 빨간 하트, 아니면 빈 하트 */}
      <span className="like-icon">{alreadyLiked ? "❤️" : "♡"}</span>
      {/* 좋아요 숫자 표시 */}
      <span className="like-count">{comment.likes || 0}</span>
    </button>
  );
}

export default LikeButton;
