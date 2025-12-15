import { useState, useEffect } from "react";
import "../../styles/chat.css";

const FloatingChatButton = ({ isOpen, onToggle, unreadCount = 0 }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <button
      className={`floating-chat-button ${isOpen ? "open" : ""} ${
        isAnimating ? "animating" : ""
      }`}
      onClick={onToggle}
      aria-label="채팅 열기/닫기"
    >
      {isOpen ? (
        <span className="chat-icon">✕</span>
      ) : (
        <>
          <span className="chat-icon">💬</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </>
      )}
    </button>
  );
};

export default FloatingChatButton;

