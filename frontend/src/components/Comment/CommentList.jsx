/**
 * 댓글/대댓글 목록 컴포넌트
 * 게시글에 달린 댓글과 대댓글을 표시하고 관리하는 컴포넌트입니다.
 * 
 * 왜 필요한가?
 * - 댓글 표시: 게시글에 달린 댓글 목록을 보여줌
 * - 대댓글 기능: 댓글에 댓글을 달 수 있는 대댓글 기능 지원
 * - 댓글 관리: 댓글 수정, 삭제, 좋아요 기능 제공
 * - 정렬 기능: 댓글을 최신순, 인기순 등으로 정렬
 */

import { useState } from "react";
import CommentEditForm from "./CommentEditForm";
import CommentActions from "./CommentActions";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import { apiPatch, apiDelete } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { MESSAGES } from "../../constants";
import "../../styles/comment.css";

export default function CommentList({
  comments,        // 전체 댓글 배열
  setComments,     // 댓글 리스트를 업데이트하는 함수
  users,           // 사용자 정보 배열 (작성자 정보 찾기용)
  currentUser,     // 로그인 중인 사용자 정보 (권한 체크용)
}) {
  // 현재 수정 중인 댓글 ID
  // 왜 필요한가? 어떤 댓글이 수정 모드인지 추적하기 위해
  const [editingCommentId, setEditingCommentId] = useState(null);
  // 정렬 타입: "latest" (최신순) 또는 "popular" (인기순)
  const [sortType, setSortType] = useState("latest");
  // 대댓글을 작성할 부모 댓글 ID
  // 왜 필요한가? 어떤 댓글에 대댓글을 달지 추적하기 위해
  const [replyTo, setReplyTo] = useState(null);
  // Toast 알림 함수들
  const { success, error: showError } = useToast();

  /**
   * 특정 댓글의 대댓글을 가져오는 함수
   * 
   * 왜 필요한가?
   * - 대댓글 필터링: 특정 댓글의 대댓글만 추출
   * - 계층 구조: 댓글과 대댓글을 구분하여 표시
   * 
   * @param {number} parentId - 부모 댓글 ID
   * @returns {Array} 해당 댓글의 대댓글 배열
   */
  const getReplies = (parentId) =>
    // filter: parentId가 일치하는 댓글만 필터링
    comments.filter((c) => c.parentId === parentId);

  /**
   * 댓글 수정 모드 진입 핸들러
   * 수정 버튼을 누르면 해당 댓글을 수정 모드로 전환합니다.
   * 
   * 왜 필요한가? 수정 모드를 추적하여 수정 폼을 표시하기 위해
   */
  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
  };

  /**
   * 댓글 수정/저장 핸들러
   * 댓글 수정을 서버에 저장하고 목록을 업데이트합니다.
   * 
   * 왜 필요한가?
   * - 댓글 수정: 사용자가 작성한 댓글을 수정할 수 있게 함
   * - 상태 업데이트: 수정된 댓글을 목록에 반영
   * - 사용자 피드백: 성공/실패 메시지 표시
   */
  const handleSave = async (commentId, newText) => {
    try {
      // 서버에 댓글 수정 요청
      await apiPatch("comments", commentId, { text: newText });
      // 댓글 목록 업데이트: 수정된 댓글만 변경
      // map: 모든 댓글을 순회하며 수정된 댓글만 업데이트
      // 왜 이렇게 하나? 불변성을 유지하면서 상태를 업데이트하기 위해
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c))
      );
      // 수정 모드 종료
      setEditingCommentId(null);
      success(MESSAGES.COMMENT_UPDATE_SUCCESS);
    } catch (err) {
      showError(err.message || MESSAGES.COMMENT_UPDATE_FAIL);
    }
  };

  /**
   * 댓글 삭제 핸들러
   * 댓글을 삭제하고 목록에서 제거합니다.
   * 
   * 왜 필요한가?
   * - 댓글 삭제: 사용자가 작성한 댓글을 삭제할 수 있게 함
   * - 확인 다이얼로그: 실수로 삭제하는 것을 방지
   * - 상태 업데이트: 삭제된 댓글을 목록에서 제거
   */
  const handleDelete = async (comment) => {
    // 확인 다이얼로그: 사용자에게 삭제 확인 요청
    // 왜 필요한가? 실수로 삭제하는 것을 방지하기 위해
    if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
      try {
        // 서버에 댓글 삭제 요청
        await apiDelete("comments", comment.id);
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        success(MESSAGES.COMMENT_DELETE_SUCCESS);
      } catch (err) {
        showError(err.message || MESSAGES.COMMENT_DELETE_FAIL);
      }
    }
  };

  /**
   * 댓글 좋아요 처리 핸들러
   * 댓글에 좋아요를 누르거나 취소합니다.
   * 
   * 왜 필요한가?
   * - 좋아요 기능: 사용자가 댓글에 좋아요를 표현할 수 있게 함
   * - 상태 업데이트: 좋아요 수와 좋아요한 사용자 목록을 업데이트
   * - 로그인 체크: 로그인한 사용자만 좋아요 가능
   */
  const handleLike = async (comment, alreadyLiked) => {
    // 로그인 체크: 로그인하지 않은 사용자는 좋아요 불가
    if (!currentUser) {
      showError(MESSAGES.LOGIN_REQUIRED);
      return;
    }
    try {
      // 서버에 좋아요 토글 요청
      const updatedComment = await apiPatch("comments", `${comment.id}/like`, {});
<<<<<<< HEAD
      
      // likedUserIds를 배열로 변환 (문자열일 수 있으므로)
      let likedUserIds = [];
      if (Array.isArray(updatedComment.likedUserIds)) {
        likedUserIds = updatedComment.likedUserIds.map(id => Number(id)).filter(id => !isNaN(id));
      } else if (typeof updatedComment.likedUserIds === 'string' && updatedComment.likedUserIds.trim() !== '') {
        likedUserIds = updatedComment.likedUserIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id !== '')
          .map(id => Number(id))
          .filter(id => !isNaN(id));
      }
      
=======
      // 댓글 목록 업데이트: 좋아요 수와 좋아요한 사용자 목록 업데이트
      // map: 모든 댓글을 순회하며 좋아요가 업데이트된 댓글만 변경
>>>>>>> 6508d0144fa98ebfa0d35614ecbfa861759feb9a
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, likes: updatedComment.likes, likedUserIds: likedUserIds }
            : c
        )
      );
    } catch (err) {
      showError(err.message || "좋아요 업데이트에 실패했습니다.");
    }
  };

  // 정렬된 전체 댓글 목록
  // 스프레드 연산자([...comments]): 원본 배열을 복사하여 정렬 (불변성 유지)
  // 왜 복사하나? 원본 배열을 변경하지 않기 위해
  const sortedComments = [...comments].sort((a, b) => {
    if (sortType === "likes") {
      // 좋아요순: 좋아요 수가 많은 순서대로 정렬
      return b.likes - a.likes;
    }
    // 최신순: 생성일시가 최신인 순서대로 정렬
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 댓글/답글 구분: parentId가 없는 댓글만 필터링 (일반 댓글)
  // 왜 필요한가? 대댓글은 일반 댓글 아래에 표시되므로 일반 댓글만 먼저 표시
  const parentComments = sortedComments.filter((c) => !c.parentId);

  return (
    <div className="comment-list-wrapper">
      {/* 정렬 버튼 영역 */}
      <div className="comment-sort-buttons">
        {/* 최신순 버튼 */}
        <button
          className={`comment-sort-button${
            sortType === "latest" ? " active" : ""
          }`}
          onClick={() => setSortType("latest")}
        >
          최신순
        </button>
        {/* 좋아요순 버튼 */}
        <button
          className={`comment-sort-button${
            sortType === "likes" ? " active" : ""
          }`}
          onClick={() => setSortType("likes")}
        >
          좋아요순
        </button>
      </div>

      {/* 댓글 목록 렌더링 */}
      {parentComments.map((comment) => {
        // 댓글 작성자 정보 찾기
        const user = users.find((u) => String(u.id) === String(comment.userId));
        const isEditing = editingCommentId === comment.id;

        return (
          <div key={comment.id} className="comment-thread">
            <div className="comment-item">
              <div className="comment-avatar">
                <span>{user?.name?.charAt(0) || "G"}</span>
              </div>
              <div className="comment-body">
                {isEditing ? (
                  <CommentEditForm
                    comment={comment}
                    onSave={(newText) => handleSave(comment.id, newText)}
                    onCancel={() => setEditingCommentId(null)}
                  />
                ) : (
                  <>
                    <div className="comment-header">
                      <span className="comment-author">
                        {user?.name || comment.authorName || "익명"}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    {/* 좋아요, 수정, 삭제, 답글버튼 */}
                    <div className="comment-footer">
                      <LikeButton
                        comment={comment}
                        currentUser={currentUser}
                        onLike={handleLike}
                      />
                      <CommentActions
                        comment={comment}
                        currentUser={currentUser}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                      {currentUser && (
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="comment-reply-button"
                        >
                          답글달기
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 답글 입력 */}
            {replyTo === comment.id && (
              <div className="reply-form-container">
                <CommentForm
                  currentUser={currentUser}
                  id={comment.postId}
                  setComments={setComments}
                  parentId={comment.id}
                  onCancel={() => setReplyTo(null)}
                />
              </div>
            )}

            {/* 대댓글 목록 렌더링 */}
            <div className="replies-container">
              {getReplies(comment.id).map((reply) => {
                const replyUser = users.find(
                  (u) => String(u.id) === String(reply.userId)
                );
                const isReplyEditing = editingCommentId === reply.id;

                return (
                  <div className="comment-item reply-item" key={reply.id}>
                    <div className="comment-avatar">
                      <span>{replyUser?.name?.charAt(0) || "G"}</span>
                    </div>
                    <div className="comment-body">
                      {isReplyEditing ? (
                        <CommentEditForm
                          comment={reply}
                          onSave={(newText) => handleSave(reply.id, newText)}
                          onCancel={() => setEditingCommentId(null)}
                        />
                      ) : (
                        <>
                          <div className="comment-header">
                            <span className="comment-author">
                              {replyUser?.name || reply.authorName || "익명"}
                            </span>
                            <span className="comment-date">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="comment-text">{reply.text}</p>
                          <div className="comment-footer">
                            <LikeButton
                              comment={reply}
                              currentUser={currentUser}
                              onLike={handleLike}
                            />
                            <CommentActions
                              comment={reply}
                              currentUser={currentUser}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
