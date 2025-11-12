import { useUser } from "../../hooks/UserContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentList from "../Comment/CommentList";
import CommentForm from "../Comment/CommentForm";
import { apiGet, apiPatch } from "../../api/fetch";
import "../../styles/post.css";

// 게시글 상세 페이지 컴포넌트
function PostDetail() {
  const { user: currentUser } = useUser(); // 현재 로그인 사용자 정보
  const { id } = useParams(); // URL 파라미터에서 게시글 ID 가져오기
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null); // 게시글 데이터 상태
  const [postUser, setPostUser] = useState(null); // 게시글 작성자 정보
  const [comments, setComments] = useState([]); // 댓글 목록 상태
  const [users, setUsers] = useState([]); // 사용자 목록 상태

  // 사용자 목록 한번만 불러오기
  useEffect(() => {
    apiGet("users").then((data) => setUsers(data));
  }, []);

  // 게시글과 댓글 불러오기 및 조회수 증가 처리
    useEffect(() => {
      // 게시글 정보 조회
      apiGet("posts", id).then((data) => {
        setPost(data);
        // 조회수 1 증가
        apiPatch("posts", id, { views: (data.views || 0) + 1 });
      });

      // 해당 게시글 댓글 목록 조회
      apiGet("comments", `?postId=${id}`).then((data) => {
        // 댓글에 기본 값들 보정
        const enriched = data.map((c) => ({
          ...c,
          createdAt: c.createdAt || new Date().toISOString(),
          likes: c.likes || 0,
          likedUserIds: Array.isArray(c.likedUserIds) ? c.likedUserIds : [],
      }));
      setComments(enriched);
    });
  }, [id]);

  // 게시글 작성자 정보 찾기
  useEffect(() => {
    if (post && users.length > 0) {
      const user = users.find((u) => String(u.id) === String(post.userId));
      setPostUser(user);
    }
  }, [post, users]);

  // 게시판으로 돌아가는 함수
  const handleBackToBoard = () => {
    // 이전 페이지가 게시판이었다면 해당 페이지로 돌아가기
    if (location.state?.fromBoard) {
      let url = "/post";
      const params = [];
      if (location.state.page) params.push(`page=${location.state.page}`);
      if (location.state.sort) params.push(`sort=${location.state.sort}`);
      if (params.length > 0) url += "?" + params.join("&");
      navigate(url);
    } else {
      navigate(-1);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail-wrapper">
      <div className="post-card">
        {/* 목록으로 돌아가기 버튼 */}
        <button className="back-to-board-button" onClick={handleBackToBoard}>
          &larr; 목록으로
        </button>
        {/* 게시글 헤더 영역 */}
        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            {/* 게시글에 작성자, 작성일, 조회수 표시 */}
            <span>
              작성자: {postUser?.name || post.authorName || post.authorId}
            </span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            <span>조회수: {post.views}</span>
          </div>
        </div>
        {/* 게시글 내용 */}
        <div className="post-content">{post.content}</div>
        {/* 게시글 이미지 */}
        {post.image && (
          <div className="post-detail-image-box">
            <img
              src={post.image} 
              alt="게시글 이미지"
              className="post-detail-image"
            />
          </div>
        )}
        {/* 게시글 수정/삭제 버튼 및 동작 */}
        <PostActions
          post={post}
          postUser={postUser}
          currentUser={currentUser}
          id={id}
          navigate={navigate}
        />
      </div>
      {/* 댓글 섹션 */}
      <div className="comment-section">
        {/* 댓글 개수 표시 */}
        <div className="comment-count-box">
          <span className="comment-count-icon">💬</span>
          <span className="comment-count-text">
            댓글 <b>{comments.length}</b>개
          </span>
        </div>
        {/* 댓글 목록 */}
        <CommentList
          comments={comments}
          setComments={setComments}
          users={users}
          currentUser={currentUser}
        />
        {/* 댓글 작성 폼 또는 로그인 안내 */}
        {currentUser ? (
          <CommentForm
            currentUser={currentUser}
            id={id}
            setComments={setComments}
          />
        ) : (
          <div className="login-prompt-for-comment">
            댓글을 작성하려면 로그인하세요.
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail;
