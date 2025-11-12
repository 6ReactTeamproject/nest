import { useState, useEffect } from "react";
import { useUser } from "../../hooks/UserContext";
import { apiGet, apiPost } from "../../api/fetch";
import "./Message.css";

const MessageDetail = ({ message, onClose, onMessageSent }) => {
  const { user } = useUser();
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyData, setReplyData] = useState({ title: "", content: "" });

  // 보낸 사람과 받는 사람 정보 가져오기
  useEffect(() => {
    apiGet("users").then((users) => {
      const foundSender = users.find(
        (u) => String(u.id) === String(message.senderId)
      );
      const foundReceiver = users.find(
        (u) => String(u.id) === String(message.receiverId)
      );
      setSender(foundSender);
      setReceiver(foundReceiver);
    });
  }, [message]);

  // 답장 전송 처리
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    // 제목과 내용 검증
    if (!replyData.title.trim() || !replyData.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      // 새 메시지 객체 생성
      const newMessage = {
        title: replyData.title,
        content: replyData.content,
        senderId: user.id,
        receiverId: message.senderId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      await apiPost("messages", newMessage);

      // 답장 폼 초기화
      setReplyData({ title: "", content: "" });
      setShowReplyForm(false);

      // 부모 컴포넌트에 메시지 전송 완료 알림
      if (onMessageSent) {
        onMessageSent();
      }

      alert("답장이 전송되었습니다.");
    } catch (error) {
      console.error("답장 전송 실패:", error);
      alert("답장 전송에 실패했습니다.");
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
              {new Date(message.createdAt).toLocaleString()}
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
        {message.senderId !== user.id && !showReplyForm && (
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
