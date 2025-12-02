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
  onMessageUpdate,
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const { error: showError } = useToast();

  // isRead 값을 boolean으로 변환하는 헬퍼 함수
  const toBoolean = (value) => {
    if (value === true || value === 1 || value === "true" || value === "1") {
      return true;
    }
    return false;
  };

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

        const filteredMessages = messagesData
          .filter((message) =>
            activeTab === "received"
              ? compareIds(message.receiverId, user.id)
              : compareIds(message.senderId, user.id)
          )
          .map((message) => ({
            ...message,
            // isRead를 명시적으로 boolean으로 변환
            isRead: toBoolean(message.isRead),
          }));
        
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
    let updatedMessage = message;
    
    // 받은 쪽지이고 아직 읽지 않은 경우 읽음 상태로 변경
    if (activeTab === "received" && !message.isRead) {
      try {
        console.log("읽음 처리 시작:", message.id, message.isRead);
        // 메시지 읽음 상태 업데이트
        const response = await apiPatch("messages", message.id, { isRead: true });
        console.log("백엔드 응답:", response);
        // 백엔드에서 반환된 업데이트된 메시지 사용
        updatedMessage = {
          ...response,
          isRead: toBoolean(response.isRead),
        };
        console.log("업데이트된 메시지:", updatedMessage);
        
        // 로컬 상태 업데이트
        const updatedMessages = messages.map((msg) =>
          msg.id === message.id ? updatedMessage : msg
        );
        setMessages(updatedMessages);
        console.log("상태 업데이트 완료, 업데이트된 메시지 목록:", updatedMessages);
        
        // 부모 컴포넌트에 메시지 업데이트 알림
        if (onMessageUpdate) {
          onMessageUpdate(updatedMessage);
        }
      } catch (err) {
        console.error("읽음 상태 변경 실패:", err);
      }
    }
    // 선택된 메시지 설정 (업데이트된 메시지 전달)
    onSelectMessage(updatedMessage);
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
        messages.map((message) => {
          // isRead는 이미 boolean으로 변환되어 있음
          const isUnread = !message.isRead && activeTab === "received";
          
          // 디버깅: 메시지 상태 확인
          if (message.id === selectedMessage?.id) {
            console.log("렌더링 중 메시지 상태:", {
              id: message.id,
              isRead: message.isRead,
              isUnread: isUnread,
              activeTab: activeTab,
            });
          }
          
          return (
          <div
            key={message.id}
            className={`message-item ${isUnread ? "unread" : ""} ${
              selectedMessage?.id === message.id ? "selected" : ""
            }`}
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
          );
        })
      )}
    </div>
  );
};

export default MessageList;
