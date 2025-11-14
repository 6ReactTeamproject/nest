import React, { useState, useEffect } from "react";
import { apiGet, apiPatch } from "../../api/fetch";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import { compareIds, formatDateOnly } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

const MessageList = ({
  activeTab,
  onSelectMessage,
  selectedMessage,
  showForm,
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const { error: showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [usersRes, messagesData] = await Promise.all([
          apiGet("user/info"),
          apiGet("messages/all"),
        ]);

        const usersList = usersRes.data ?? usersRes;
        setUsers(Array.isArray(usersList) ? usersList : []);

        const filteredMessages = messagesData.filter((message) =>
          activeTab === "received"
            ? compareIds(message.receiverId, user.id)
            : compareIds(message.senderId, user.id)
        );
        
        const sortedMessages = filteredMessages.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMessages(sortedMessages);
      } catch (err) {
        showError("데이터를 불러오는데 실패했습니다.");
      }
    };

    loadData();
  }, [user, activeTab, showForm]);

  // 메시지 클릭 시 읽음 처리 및 선택
  const handleMessageClick = async (message) => {
    // 받은 쪽지이고 아직 읽지 않은 경우 읽음 상태로 변경
    if (activeTab === "received" && !message.isRead) {
      try {
        // 메시지 읽음 상태 업데이트
        await apiPatch("messages", message.id, { isRead: true });
        // 로컬 상태 업데이트
        setMessages(
          messages.map((msg) =>
            msg.id === message.id ? { ...msg, isRead: true } : msg
          )
        );
      } catch (err) {
        console.error("읽음 상태 변경 실패:", err);
      }
    }
    // 선택된 메시지 설정
    onSelectMessage(message);
  };

  if (!user) {
    // 로그인 상태가 아니면 컴포넌트 렌더링 안 함
    return null;
  }

  const getSenderName = (userId) => {
    const foundUser = users.find((u) => compareIds(u.id, userId));
    return foundUser ? foundUser.name : "알 수 없음";
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <p className="no-messages">쪽지가 없습니다.</p>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message-item ${
              !message.isRead && activeTab === "received" ? "unread" : ""
            } 
                       ${selectedMessage?.id === message.id ? "selected" : ""}`}
            onClick={() => handleMessageClick(message)}
          >
            <div className="message-preview">
              <span className="sender">
                {activeTab === "received"
                  ? getSenderName(message.senderId) // 받은 쪽지일 땐 보낸 사람 이름 표시
                  : getSenderName(message.receiverId)} {/* 보낸 쪽지일 땐 받는 사람 이름 표시 */}
              </span>
              <span className="date">
                {formatDateOnly(message.createdAt)}
              </span>
            </div>
            <div className="message-content-preview">{message.title}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
