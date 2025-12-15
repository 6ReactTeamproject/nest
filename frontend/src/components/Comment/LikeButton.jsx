function LikeButton({ comment, currentUser, onLike }) {
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

  const alreadyLiked = currentUser
    ? likedUserIds.includes(Number(currentUser.id))
    : false;

  return (
    <button
      onClick={() => onLike(comment, alreadyLiked)}
      className={`like-button ${alreadyLiked ? "liked" : ""}`}
    >
      <span className="like-icon">{alreadyLiked ? "❤️" : "♡"}</span>
      <span className="like-count">{comment.likes || 0}</span>
    </button>
  );
}

export default LikeButton;
