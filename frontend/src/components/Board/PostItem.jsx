import "../../styles/board.css";

const PostItem = ({ users, post, onClick }) => {
  // 작성자 정보 찾기
  const author = users.find(
    (user) => user.id.toString() === post.userId.toString()
  );

  return (
    // 게시글 아이템 전체를 클릭 가능하게 설정
    <li className="post-item" onClick={onClick}>
      {/* 게시글 제목 */}
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">
        {post.content.length > 100
          ? `${post.content.substring(0, 100)}...`
          : post.content}
      </p>

      {/* 작성자, 작성일, 조회수 정보 */}
      <div className="post-meta">
        <span className="post-author">
          작성자: {author?.name || "알 수 없음"}
        </span>
        <span className="post-date">작성일: {post.createdAt}</span>
        <span className="post-views">조회수: {post.views || 0}</span>
      </div>
    </li>
  );
};

export default PostItem;
