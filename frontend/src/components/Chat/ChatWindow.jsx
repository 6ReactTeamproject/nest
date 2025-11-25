import { useState, useEffect, useRef } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import { apiGet } from "../../api/fetch";
import { compareIds } from "../../utils/helpers";
import "../../styles/chat.css";

/**
 * 채팅 윈도우 컴포넌트
 * 플로팅 채팅 UI
 */
const ChatWindow = ({ isOpen, onClose, socket }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  const [rooms] = useState(["general", "travel", "food"]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("public"); // "public" or "private"
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateChats, setPrivateChats] = useState(new Map()); // userId -> roomId
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const { error: showError } = useToast();

  // 사용자 목록 불러오기
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadUsers = async () => {
      try {
        const usersRes = await apiGet("user/info");
        const usersList = usersRes.data ?? usersRes;
        // 현재 사용자 제외
        const filteredUsers = Array.isArray(usersList)
          ? usersList.filter((u) => !compareIds(u.id, user.id))
          : [];
        setUsers(filteredUsers);
      } catch (err) {
        showError("사용자 목록을 불러오는데 실패했습니다.");
      }
    };

    loadUsers();
  }, [isOpen, user, showError]);

  // 1:1 채팅방 ID 생성 (항상 같은 순서로 정렬하여 일관성 유지)
  const getPrivateRoomId = (userId1, userId2) => {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `private-${sorted[0]}-${sorted[1]}`;
  };

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    if (!isOpen) {
      return;
    }

    // 소켓 연결 상태 확인
    const checkConnection = () => {
      if (socket.connected) {
        console.log("소켓이 이미 연결되어 있습니다.");
        setIsConnected(true);
        const roomToJoin =
          activeTab === "private" && selectedUser
            ? getPrivateRoomId(user.id, selectedUser.id)
            : currentRoom;
        socket.emit("joinRoom", { roomId: roomToJoin });
      } else {
        console.log("소켓 연결 대기 중...");
        setIsConnected(false);
        // 연결 시도
        socket.connect();
      }
    };

    checkConnection();

    const handleConnect = () => {
      console.log("ChatWindow: 소켓 연결 성공");
      setIsConnected(true);
      // 기본 방 입장
      const roomToJoin =
        activeTab === "private" && selectedUser
          ? getPrivateRoomId(user.id, selectedUser.id)
          : currentRoom;
      console.log("방 입장:", roomToJoin);
      socket.emit("joinRoom", { roomId: roomToJoin });
    };

    const handleDisconnect = (reason) => {
      console.log("ChatWindow: 소켓 연결 해제:", reason);
      setIsConnected(false);
    };

    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, type: "message" }]);
    };

    const handleSystemMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, type: "system" }]);
    };

    const handleError = (data) => {
      showError(data.message || "오류가 발생했습니다.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatMessage", handleChatMessage);
    socket.on("systemMessage", handleSystemMessage);
    socket.on("error", handleError);

    // 연결 상태 확인을 위한 주기적 체크 (개발용)
    const connectionCheck = setInterval(() => {
      if (socket && !socket.connected && isOpen) {
        console.log("소켓 연결 재시도...");
        socket.connect();
      }
    }, 2000);

    return () => {
      clearInterval(connectionCheck);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chatMessage", handleChatMessage);
      socket.off("systemMessage", handleSystemMessage);
      socket.off("error", handleError);
    };
  }, [socket, isOpen, currentRoom, activeTab, selectedUser, user, showError]);

  // 방 변경 시 (공개 방 또는 1:1 채팅)
  useEffect(() => {
    if (!socket || !isOpen || !isConnected) return;

    // 이전 방 나가기
    const previousRoom =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user.id, selectedUser.id)
        : currentRoom;
    socket.emit("leaveRoom", { roomId: previousRoom });

    // 새 방 입장
    setTimeout(() => {
      const newRoom =
        activeTab === "private" && selectedUser
          ? getPrivateRoomId(user.id, selectedUser.id)
          : currentRoom;
      socket.emit("joinRoom", { roomId: newRoom });
      setMessages([]); // 방 변경 시 메시지 초기화
    }, 100);
  }, [currentRoom, activeTab, selectedUser, socket, isOpen, isConnected, user]);

  // 사용자 선택 시 1:1 채팅방 생성
  const handleSelectUser = (selectedUserData) => {
    setSelectedUser(selectedUserData);
    setActiveTab("private");
    const roomId = getPrivateRoomId(user.id, selectedUserData.id);
    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      newMap.set(selectedUserData.id, roomId);
      return newMap;
    });
  };

  // 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const roomId =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user.id, selectedUser.id)
        : currentRoom;

    socket.emit("chatMessage", {
      roomId: roomId,
      message: inputMessage,
    });

    setInputMessage("");
  };

  // 채팅 윈도우 닫기 애니메이션
  const handleClose = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.classList.add("closing");
      setTimeout(() => {
        onClose();
        chatWindowRef.current?.classList.remove("closing");
      }, 300);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayRoomName =
    activeTab === "private" && selectedUser
      ? selectedUser.name
      : currentRoom === "general"
      ? "일반"
      : currentRoom === "travel"
      ? "여행"
      : "음식";

  return (
    <div
      ref={chatWindowRef}
      className={`chat-window ${isOpen ? "open" : ""}`}
    >
      <div className="chat-header">
        <div className="chat-header-content">
          <h3>실시간 채팅</h3>
          <div className="chat-tabs">
            <button
              className={`chat-tab ${activeTab === "public" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("public");
                setSelectedUser(null);
              }}
            >
              공개 방
            </button>
            <button
              className={`chat-tab ${activeTab === "private" ? "active" : ""}`}
              onClick={() => setActiveTab("private")}
            >
              1:1 채팅
            </button>
          </div>
          {activeTab === "public" ? (
            <div className="room-selector">
              <select
                value={currentRoom}
                onChange={(e) => setCurrentRoom(e.target.value)}
                className="room-select"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room === "general"
                      ? "일반"
                      : room === "travel"
                      ? "여행"
                      : "음식"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="current-chat-info">
              {selectedUser ? (
                <span className="chat-with">💬 {displayRoomName}</span>
              ) : (
                <span className="select-user-hint">사용자를 선택하세요</span>
              )}
            </div>
          )}
        </div>
        <button className="chat-close-button" onClick={handleClose}>
          ✕
        </button>
      </div>

      {activeTab === "private" && !selectedUser && (
        <div className="user-list-container">
          <div className="user-list-header">
            <h4>사용자 선택</h4>
          </div>
          <div className="user-list">
            {users.length === 0 ? (
              <div className="empty-users">사용자가 없습니다.</div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  className="user-item"
                  onClick={() => handleSelectUser(u)}
                >
                  <div className="user-avatar">
                    {u.image ? (
                      <img src={u.image} alt={u.name} />
                    ) : (
                      <span>{u.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{u.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "private" && selectedUser && (
        <div className="chat-header-info">
          <button
            className="back-to-users"
            onClick={() => setSelectedUser(null)}
          >
            ← 목록
          </button>
        </div>
      )}

      {/* 메시지 영역은 사용자 목록이 아닐 때만 표시 */}
      {!(activeTab === "private" && !selectedUser) && (
        <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>메시지가 없습니다. 첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message-item ${
                msg.type === "system" ? "system" : ""
              } ${msg.username === user?.name ? "own" : ""}`}
            >
              {msg.type === "system" ? (
                <div className="system-message">{msg.message}</div>
              ) : (
                <>
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">
                      {new Date(msg.time).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      )}

      {/* 입력 영역도 사용자 목록이 아닐 때만 표시 */}
      {!(activeTab === "private" && !selectedUser) && (
        <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
          disabled={!isConnected}
          className="chat-input"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          className="chat-send-button"
        >
          전송
        </button>
      </form>
      )}

      {!isConnected && !(activeTab === "private" && !selectedUser) && (
        <div className="connection-status">
          {socket ? "연결 중..." : "소켓을 초기화하는 중..."}
        </div>
      )}
      
      {/* 디버깅 정보 (개발용) */}
      {process.env.NODE_ENV === 'development' && socket && (
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          fontSize: '10px', 
          color: '#999',
          background: 'rgba(0,0,0,0.1)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          Socket: {socket.connected ? '연결됨' : '연결 안됨'} | ID: {socket.id || '없음'}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

