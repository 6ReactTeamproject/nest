/**
 * 게시글 상세 페이지 컴포넌트
 * 게시글의 상세 내용과 댓글을 표시하는 페이지입니다.
 * 
 * 왜 필요한가?
 * - 게시글 상세 표시: 게시글의 전체 내용을 보여줌
 * - 댓글 기능: 게시글에 달린 댓글을 표시하고 작성할 수 있게 함
 * - 조회수 증가: 게시글을 조회할 때마다 조회수 자동 증가
 * - 작성자 정보: 게시글 작성자 정보 표시
 */

import { useUser } from "../../hooks/UserContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostActions from "./PostActions";
import CommentList from "../Comment/CommentList";
import CommentForm from "../Comment/CommentForm";
import { apiGet, apiPatch } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { findUserById, formatDate } from "../../utils/helpers";
import { MESSAGES } from "../../constants";
import "../../styles/post.css";

function PostDetail() {
  // 전역 사용자 상태: 현재 로그인한 사용자 정보
  const { user: currentUser } = useUser();
  // URL 파라미터에서 게시글 ID 추출
  const { id } = useParams();
  // React Router의 navigate 훅: 페이지 이동을 위해
  const navigate = useNavigate();
  // 현재 위치 정보: 이전 페이지 정보를 가져오기 위해
  const location = useLocation();
  // Toast 알림 함수
  const { error: showError } = useToast();
  
  // 게시글 데이터 상태
  const [post, setPost] = useState(null);
  // 게시글 작성자 정보 상태
  const [postUser, setPostUser] = useState(null);
  // 댓글 목록 상태
  const [comments, setComments] = useState([]);
  // 사용자 목록 상태 (작성자 정보 찾기용)
  const [users, setUsers] = useState([]);
  // 로딩 상태: 데이터 로딩 중인지 추적
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 데이터 로딩 효과
   * 컴포넌트가 마운트되거나 게시글 ID가 변경될 때 데이터를 로드합니다.
   * 
   * 왜 필요한가?
   * - 초기 데이터 로드: 페이지 진입 시 게시글, 댓글, 사용자 정보 로드
   * - 병렬 로딩: Promise.all을 사용하여 여러 API를 동시에 호출하여 성능 최적화
   * - 데이터 보정: 댓글 데이터의 누락된 필드를 기본값으로 채움
   * - 조회수 증가: 게시글 조회 시 조회수 자동 증가
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 사용자 목록과 게시글, 댓글을 병렬로 로드
        // Promise.all: 여러 비동기 작업을 동시에 실행하여 성능 최적화
        // 왜 병렬로 하나? 순차적으로 실행하면 시간이 오래 걸리므로
        const [usersData, postData, commentsData] = await Promise.all([
          apiGet("user/all"),                    // 모든 사용자 정보
          apiGet("posts", id),                   // 게시글 정보
          apiGet("comments", `?postId=${id}`),   // 댓글 목록
        ]);

        setUsers(usersData);
        setPost(postData);
        
<<<<<<< HEAD
        // 댓글 데이터 보정
        const enriched = commentsData.map((c) => {
          // likedUserIds를 배열로 변환 (문자열일 수 있으므로)
          let likedUserIds = [];
          if (Array.isArray(c.likedUserIds)) {
            likedUserIds = c.likedUserIds.map(id => Number(id)).filter(id => !isNaN(id));
          } else if (typeof c.likedUserIds === 'string' && c.likedUserIds.trim() !== '') {
            likedUserIds = c.likedUserIds
              .split(',')
              .map(id => id.trim())
              .filter(id => id !== '')
              .map(id => Number(id))
              .filter(id => !isNaN(id));
          }
          
          return {
            ...c,
            createdAt: c.createdAt || new Date().toISOString(),
            likes: c.likes || 0,
            likedUserIds: likedUserIds,
          };
        });
=======
        // 댓글 데이터 보정: 누락된 필드를 기본값으로 채움
        // 왜 필요한가? 서버에서 일부 필드가 누락될 수 있으므로
        const enriched = commentsData.map((c) => ({
          ...c,
          createdAt: c.createdAt || new Date().toISOString(), // 생성일시 기본값
          likes: c.likes || 0,                                 // 좋아요 수 기본값
          likedUserIds: Array.isArray(c.likedUserIds) ? c.likedUserIds : [], // 좋아요한 사용자 ID 배열 기본값
        }));
>>>>>>> 6508d0144fa98ebfa0d35614ecbfa861759feb9a
        setComments(enriched);

        // 조회수 증가 (에러는 무시)
        // catch(() => {}): 에러가 발생해도 무시 (조회수 증가 실패해도 페이지는 정상 표시)
        // 왜 에러를 무시하나? 조회수 증가 실패가 페이지 표시를 막으면 안 되므로
        apiPatch("posts", `${id}/view`, {}).catch(() => {});

        // 작성자 정보 찾기
        // 왜 필요한가? 게시글 작성자 이름을 표시하기 위해
        if (postData && usersData.length > 0) {
          const user = findUserById(usersData, postData.userId);
          setPostUser(user);
        }
      } catch (err) {
        showError(MESSAGES.LOADING + " " + err.message);
      } finally {
        // 로딩 상태 종료: 성공/실패와 관계없이 항상 실행
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]); // id가 변경될 때마다 다시 로드

  /**
   * 게시판으로 돌아가는 함수
   * 게시판 목록 페이지로 돌아갑니다.
   * 
   * 왜 필요한가?
   * - 네비게이션: 사용자가 게시판 목록으로 돌아갈 수 있게 함
   * - 상태 유지: 이전 페이지의 페이지 번호, 정렬 방식 등을 유지
   */
  const handleBackToBoard = () => {
    // 이전 페이지가 게시판이었다면 해당 페이지로 돌아가기
    // location.state: 이전 페이지에서 전달한 상태 정보
    // 왜 이렇게 하나? 사용자가 보고 있던 페이지와 정렬 방식을 유지하기 위해
    if (location.state?.fromBoard) {
      let url = "/post";
      const params = [];
      // 페이지 번호와 정렬 방식을 URL 파라미터로 추가
      if (location.state.page) params.push(`page=${location.state.page}`);
      if (location.state.sort) params.push(`sort=${location.state.sort}`);
      if (params.length > 0) url += "?" + params.join("&");
      navigate(url);
    } else {
      // 이전 페이지로 돌아가기
      navigate(-1);
    }
  };

  if (isLoading) return <div>{MESSAGES.LOADING}</div>;
  if (!post) return <div>{MESSAGES.NO_DATA}</div>;

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
            <span>{formatDate(post.createdAt)}</span>
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
          currentUser={currentUser}
          id={id}
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
