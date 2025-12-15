import { useUser } from "../../hooks/UserContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostActions from "./PostActions";
import CommentList from "../Comment/CommentList";
import CommentForm from "../Comment/CommentForm";
import { apiGet, apiPatch } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { findUserById, formatDate } from "../../utils/helpers";
import { MESSAGES, API_BASE_URL } from "../../constants";
import "../../styles/post.css";

function PostDetail() {
  const { user: currentUser } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError } = useToast();

  const [post, setPost] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [usersData, postData, commentsData] = await Promise.all([
          apiGet("user/all"),
          apiGet("posts", id),
          apiGet("comments", `?postId=${id}`),
        ]);

        setUsers(usersData);
        setPost(postData);

        const enriched = commentsData.map((c) => {
          let likedUserIds = [];
          if (Array.isArray(c.likedUserIds)) {
            likedUserIds = c.likedUserIds
              .map((id) => Number(id))
              .filter((id) => !isNaN(id));
          } else if (
            typeof c.likedUserIds === "string" &&
            c.likedUserIds.trim() !== ""
          ) {
            likedUserIds = c.likedUserIds
              .split(",")
              .map((id) => id.trim())
              .filter((id) => id !== "")
              .map((id) => Number(id))
              .filter((id) => !isNaN(id));
          }

          return {
            ...c,
            createdAt: c.createdAt || new Date().toISOString(),
            likes: c.likes || 0,
            likedUserIds: likedUserIds,
          };
        });
        setComments(enriched);

        apiPatch("posts", `${id}/view`, {}).catch(() => {});

        if (postData && usersData.length > 0) {
          const user = findUserById(usersData, postData.userId);
          setPostUser(user);
        }
      } catch (err) {
        showError(MESSAGES.LOADING + " " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleBackToBoard = () => {
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

  if (isLoading) return <div>{MESSAGES.LOADING}</div>;
  if (!post) return <div>{MESSAGES.NO_DATA}</div>;

  return (
    <div className="post-detail-wrapper">
      <div className="post-card">
        <button className="back-to-board-button" onClick={handleBackToBoard}>
          &larr; 목록으로
        </button>
        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span>
              작성자: {postUser?.name || post.authorName || post.authorId}
            </span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회수: {post.views}</span>
          </div>
        </div>
        <div className="post-content">{post.content}</div>
        {post.image && (
          <div className="post-detail-image-box">
            <img
              src={
                post.image.startsWith("http")
                  ? post.image
                  : `${API_BASE_URL}${post.image}`
              }
              alt="게시글 이미지"
              className="post-detail-image"
            />
          </div>
        )}
        <PostActions post={post} currentUser={currentUser} id={id} />
      </div>
      <div className="comment-section">
        <div className="comment-count-box">
          <span className="comment-count-icon">💬</span>
          <span className="comment-count-text">
            댓글 <b>{comments.length}</b>개
          </span>
        </div>
        <CommentList
          comments={comments}
          setComments={setComments}
          users={users}
          currentUser={currentUser}
        />
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
