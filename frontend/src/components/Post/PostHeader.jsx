import "../../styles/post.css";

// 게시글 헤더 컴포넌트
const PostHeader = ({ post }) => (
  <div className="post-header-container">
    {/* 게시글 제목 */}
    <h1 className="post-header-title">{post.title}</h1>

    {/* 게시글 내용 */}
    <div className="post-header-content">

      {/* 작성일 표시 */}
      <div className="post-header-meta">
        <span className="post-header-date">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);

export default PostHeader;
