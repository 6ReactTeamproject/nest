import { useState, useEffect } from "react";
import { useUser } from "../../hooks/UserContext";
import { apiGet, apiPost } from "../../api/fetch";
import { useToast } from "../common/Toast";
import { findUserById, formatDate } from "../../utils/helpers";
import { MESSAGES } from "../../constants";
import "./Message.css";

const MessageDetail = ({ message, onClose, onMessageSent }) => {
  const { user } = useUser();
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyData, setReplyData] = useState({ title: "", content: "" });
  const { success, error: showError } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await apiGet("user/all");
        setSender(findUserById(users, message.senderId));
        setReceiver(findUserById(users, message.receiverId));
      } catch (err) {
        showError("사용자 정보를 불러오는데 실패했습니다.");
      }
    };
    loadUsers();
  }, [message]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyData.title.trim() || !replyData.content.trim()) {
      showError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const newMessage = {
        title: replyData.title,
        content: replyData.content,
        receiverId: message.senderId,
      };

      await apiPost("messages", newMessage);
      setReplyData({ title: "", content: "" });
      setShowReplyForm(false);

      if (onMessageSent) {
        onMessageSent();
      }

      success(MESSAGES.MESSAGE_SEND_SUCCESS);
    } catch (err) {
      showError(err.message || MESSAGES.MESSAGE_SEND_FAIL);
    }
  };

  // 답장 폼 입력값 변경 처리
  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="message-detail">
      <div className="message-detail-header">
        <div className="message-info">
          <div className="message-meta">
            <span className="label">보낸 사람:</span>
            <span className="value">{sender?.name || "알 수 없음"}</span>
          </div>
          <div className="message-meta">
            <span className="label">받는 사람:</span>
            <span className="value">{receiver?.name || "알 수 없음"}</span>
          </div>
          <div className="message-meta">
            <span className="label">보낸 시간:</span>
            <span className="value">
              {formatDate(message.createdAt)}
            </span>
          </div>
        </div>
        {/* 상세보기 닫기 버튼 */}
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {/* 메시지 내용 */}
      <div className="message-detail-content">{message.content}</div>

      <div className="message-detail-footer">
        {/* 받은 쪽지인 경우에만 답장 버튼 표시 */}
        {message.senderId !== user?.id && !showReplyForm && (
          <button
            className="reply-button"
            onClick={() => setShowReplyForm(true)}
          >
            답장하기
          </button>
        )}
      </div>

      {/* 답장 */}
      {showReplyForm && (
        <div className="reply-form">
          <h3>답장 작성</h3>
          <form onSubmit={handleReplySubmit}>
            <div className="form-group">
              <label>제목:</label>
              <input
                type="text"
                name="title"
                value={replyData.title}
                onChange={handleReplyChange}
                placeholder="답장 제목을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>내용:</label>
              <textarea
                name="content"
                value={replyData.content}
                onChange={handleReplyChange}
                placeholder="답장 내용을 입력하세요"
                rows="5"
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">
                답장 전송
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyData({ title: "", content: "" });
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;
