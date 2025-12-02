import { useState } from "react";
import CommentEditForm from "./CommentEditForm";
import CommentActions from "./CommentActions";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import { apiPatch, apiDelete } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { MESSAGES } from "../../constants";
import "../../styles/comment.css";

// 댓글/대댓글 목록 컴포넌트
export default function CommentList({
  comments,        // 전체 댓글
  setComments,     // 댓글 리스트를 업데이트
  users,           // 사용자 정보 배열
  currentUser,     // 로그인 중인 사용자 정보
}) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [sortType, setSortType] = useState("latest");
  const [replyTo, setReplyTo] = useState(null);
  const { success, error: showError } = useToast();

  // 특정 댓글의 대댓글
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentId === parentId);

  // 수정 버튼 누르면 해당 댓글 id를 editingCommentId에 저장
  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
  };

  // 댓글 수정/저장
  const handleSave = async (commentId, newText) => {
    try {
      await apiPatch("comments", commentId, { text: newText });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c))
      );
      setEditingCommentId(null);
      success(MESSAGES.COMMENT_UPDATE_SUCCESS);
    } catch (err) {
      showError(err.message || MESSAGES.COMMENT_UPDATE_FAIL);
    }
  };

  // 댓글 삭제
  const handleDelete = async (comment) => {
    if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
      try {
        await apiDelete("comments", comment.id);
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        success(MESSAGES.COMMENT_DELETE_SUCCESS);
      } catch (err) {
        showError(err.message || MESSAGES.COMMENT_DELETE_FAIL);
      }
    }
  };

  // 댓글 좋아요 처리
  const handleLike = async (comment, alreadyLiked) => {
    if (!currentUser) {
      showError(MESSAGES.LOGIN_REQUIRED);
      return;
    }
    try {
      const updatedComment = await apiPatch("comments", `${comment.id}/like`, {});
      
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
  const sortedComments = [...comments].sort((a, b) => {
    if (sortType === "likes") return b.likes - a.likes; // 좋아요순
    return new Date(b.createdAt) - new Date(a.createdAt); // 최신순
  });

  // 댓글/답글 구분
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
