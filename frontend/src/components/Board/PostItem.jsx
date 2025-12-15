import "../../styles/board.css";

const PostItem = ({ users, post, onClick }) => {
  const author = users.find(
    (user) => user.id.toString() === post.userId.toString()
  );

  return (
    <li className="post-item" onClick={onClick}>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">
        {post.content.length > 100
          ? `${post.content.substring(0, 100)}...`
          : post.content}
      </p>

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
