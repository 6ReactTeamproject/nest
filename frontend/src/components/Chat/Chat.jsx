import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../constants";
import FloatingChatButton from "./FloatingChatButton";
import ChatWindow from "./ChatWindow";
import { useUser } from "../../hooks/UserContext";

/**
 * 채팅 메인 컴포넌트
 * 플로팅 버튼과 채팅 윈도우를 관리
 */
const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user } = useUser();
  const socketRef = useRef(null);

  // 소켓 연결 관리
  useEffect(() => {
    // 사용자가 로그인한 경우에만 소켓 연결
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
      }
      return;
    }

    // 소켓 연결
    const newSocket = io(`${API_BASE_URL}/chat`, {
      transports: ["websocket", "polling"], // polling도 허용 (websocket 실패 시 자동 전환)
      auth: {
        token: localStorage.getItem("access_token"),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // 연결 성공
    newSocket.on("connect", () => {
      console.log("✅ 소켓 연결 성공:", newSocket.id);
      console.log("연결 URL:", `${API_BASE_URL}/chat`);
    });

    // 연결 오류 처리
    newSocket.on("connect_error", (error) => {
      console.error("❌ 소켓 연결 오류:", error);
      console.error("오류 상세:", {
        message: error.message,
        type: error.type,
        description: error.description,
      });
    });

    // 연결 해제
    newSocket.on("disconnect", (reason) => {
      console.log("🔌 소켓 연결 해제:", reason);
    });

    // 재연결 시도
    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 재연결 시도 ${attemptNumber}번째...`);
    });

    // 재연결 성공
    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ 재연결 성공 (${attemptNumber}번째 시도)`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // 채팅 열기/닫기
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 사용자가 로그인하지 않은 경우 렌더링하지 않음
  if (!user) return null;

  return (
    <>
      <FloatingChatButton
        isOpen={isOpen}
        onToggle={handleToggle}
        unreadCount={0}
      />
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        socket={socket}
      />
    </>
  );
};

export default Chat;

