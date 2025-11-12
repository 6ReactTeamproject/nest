import { useState } from "react";
import CommentEditForm from "./CommentEditForm";
import CommentActions from "./CommentActions";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import { apiPatch } from "../../api/fetch";
import "../../styles/comment.css";

// 댓글/대댓글 목록 컴포넌트
export default function CommentList({
  comments,        // 전체 댓글
  setComments,     // 댓글 리스트를 업데이트
  users,           // 사용자 정보 배열
  currentUser,     // 로그인 중인 사용자 정보
}) {
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글
  const [sortType, setSortType] = useState("latest");                    // 정렬 방식
  const [replyTo, setReplyTo] = useState(null);                    // 답글을 작성 중인 댓글

  // 특정 댓글의 대댓글
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentId === parentId);

  // 수정 버튼 누르면 해당 댓글 id를 editingCommentId에 저장
  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
  };

  // 댓글 수정/저장
  const handleSave = (commentId, newText) => {
    // 댓글 목록에서 해당 댓글 찾아서 텍스트만 바꿔줌
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c))
    );
    // 수정 모드 해제
    setEditingCommentId(null);
  };

  // 댓글 삭제
  const handleDelete = (comment) => {
    if (window.confirm("삭제할까요?")) {
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    }
  };

  // 댓글 좋아요 처리
  const handleLike = async (comment, alreadyLiked) => {
    if (!currentUser) {
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }
    try {
      // 이미 좋아요 눌렀으면 -1, 아니면 +1
      const updatedLikes = alreadyLiked
        ? Math.max(0, comment.likes - 1)
        : comment.likes + 1;
      // likedUserIds 배열에서 현재 유저 id 추가/제거
      const updatedLikedUserIds = alreadyLiked
        ? comment.likedUserIds.filter((id) => id !== currentUser.id)
        : [...comment.likedUserIds, currentUser.id];

      // 서버에 PATCH 요청
      await apiPatch("comments", comment.id, {
        likes: updatedLikes,
        likedUserIds: updatedLikedUserIds,
      });

      // 상태 업데이트
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, likes: updatedLikes, likedUserIds: updatedLikedUserIds }
            : c
        )
      );
    } catch (error) {
      console.error("좋아요 업데이트 실패:", error);
      alert("좋아요 업데이트에 실패했습니다.");
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
