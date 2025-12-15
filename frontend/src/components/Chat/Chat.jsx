import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../constants";
import FloatingChatButton from "./FloatingChatButton";
import ChatWindow from "./ChatWindow";
import { useUser } from "../../hooks/UserContext";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user } = useUser();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(`${API_BASE_URL}/chat`, {
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("access_token"),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ 소켓 연결 성공:", newSocket.id);
      console.log("연결 URL:", `${API_BASE_URL}/chat`);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ 소켓 연결 오류:", error);
      console.error("오류 상세:", {
        message: error.message,
        type: error.type,
        description: error.description,
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 소켓 연결 해제:", reason);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 재연결 시도 ${attemptNumber}번째...`);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ 재연결 성공 (${attemptNumber}번째 시도)`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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

