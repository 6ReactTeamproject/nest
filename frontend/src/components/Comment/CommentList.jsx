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
  comments,
  setComments,
  users,
  currentUser,
}) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [sortType, setSortType] = useState("latest");
  const [replyTo, setReplyTo] = useState(null);
  const { success, error: showError } = useToast();

  const getReplies = (parentId) =>
    comments.filter((c) => c.parentId === parentId);

  const handleEdit = (comment) => {
    setEditingCommentId(comment.id);
  };

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

  const handleLike = async (comment, alreadyLiked) => {
    if (!currentUser) {
      showError(MESSAGES.LOGIN_REQUIRED);
      return;
    }
    try {
      const updatedComment = await apiPatch(
        "comments",
        `${comment.id}/like`,
        {}
      );

      let likedUserIds = [];
      if (Array.isArray(updatedComment.likedUserIds)) {
        likedUserIds = updatedComment.likedUserIds
          .map((id) => Number(id))
          .filter((id) => !isNaN(id));
      } else if (
        typeof updatedComment.likedUserIds === "string" &&
        updatedComment.likedUserIds.trim() !== ""
      ) {
        likedUserIds = updatedComment.likedUserIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
          .map((id) => Number(id))
          .filter((id) => !isNaN(id));
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

  const sortedComments = [...comments].sort((a, b) => {
    if (sortType === "likes") {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const parentComments = sortedComments.filter((c) => !c.parentId);

  return (
    <div className="comment-list-wrapper">
      <div className="comment-sort-buttons">
        <button
          className={`comment-sort-button${
            sortType === "latest" ? " active" : ""
          }`}
          onClick={() => setSortType("latest")}
        >
          최신순
        </button>
        <button
          className={`comment-sort-button${
            sortType === "likes" ? " active" : ""
          }`}
          onClick={() => setSortType("likes")}
        >
          좋아요순
        </button>
      </div>

      {parentComments.map((comment) => {
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
