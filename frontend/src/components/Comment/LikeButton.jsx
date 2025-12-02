// 좋아요 버튼 컴포넌트
function LikeButton({ comment, currentUser, onLike }) {
  // likedUserIds를 배열로 변환 (문자열일 수 있으므로)
  let likedUserIds = [];
  if (Array.isArray(comment.likedUserIds)) {
    likedUserIds = comment.likedUserIds.map(id => Number(id)).filter(id => !isNaN(id));
  } else if (typeof comment.likedUserIds === 'string' && comment.likedUserIds.trim() !== '') {
    likedUserIds = comment.likedUserIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => Number(id))
      .filter(id => !isNaN(id));
  }

  // 현재 유저가 이미 좋아요 눌렀는지 확인 (유저가 로그인했고, likedUserIds에 유저 id가 있으면 true)
  const alreadyLiked = currentUser
    ? likedUserIds.includes(Number(currentUser.id))
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
