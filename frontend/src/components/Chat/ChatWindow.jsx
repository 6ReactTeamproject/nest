import { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import { apiGet } from "../../api/fetch";
import { compareIds } from "../../utils/helpers";
import "../../styles/chat.css";

const ChatWindow = ({ isOpen, onClose, socket }) => {
  const { user } = useUser();
  const [messagesByRoom, setMessagesByRoom] = useState(new Map());
  const [inputMessage, setInputMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  const [rooms] = useState(["general", "travel", "food"]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("public");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateChats, setPrivateChats] = useState(new Map());
  const [hasLeftRoom, setHasLeftRoom] = useState(false);
  const [currentJoinedRoom, setCurrentJoinedRoom] = useState(null);
  const [leftRooms, setLeftRooms] = useState(new Set());
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const hasLeftRoomRef = useRef(false);
  const { error: showError, success } = useToast();

  const getPrivateRoomId = (userId1, userId2) => {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `private-${sorted[0]}-${sorted[1]}`;
  };

  const messages = useMemo(() => {
    const roomId =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user?.id, selectedUser?.id)
        : currentRoom;
    const roomMessages = messagesByRoom.get(roomId) || [];
    console.log(
      "ChatWindow: 현재 방 메시지 조회, roomId:",
      roomId,
      "메시지 수:",
      roomMessages.length
    );
    return roomMessages;
  }, [messagesByRoom, activeTab, selectedUser, currentRoom, user?.id]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const loadUsers = async () => {
      try {
        const usersRes = await apiGet("user/info");
        const usersList = usersRes.data ?? usersRes;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    if (!isOpen) {
      return;
    }

    const checkConnection = () => {
      if (socket.connected) {
        console.log("소켓이 이미 연결되어 있습니다.");
        setIsConnected(true);
      } else {
        console.log("소켓 연결 대기 중...");
        setIsConnected(false);
        socket.connect();
      }
    };

    checkConnection();

    const handleConnect = () => {
      console.log("ChatWindow: 소켓 연결 성공");
      setIsConnected(true);
      setHasLeftRoom(false);
    };

    const handleDisconnect = (reason) => {
      console.log("ChatWindow: 소켓 연결 해제:", reason);
      setIsConnected(false);
    };

    const handleChatMessage = (data) => {
      console.log("ChatWindow: 메시지 수신:", data);

      if (!data.roomId) {
        console.error("ChatWindow: roomId가 없습니다:", data);
        return;
      }

      const messageWithUserId = {
        ...data,
        type: "message",
        userId: data.userId || null,
        timestamp: new Date(data.time).getTime(),
      };

      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        const roomMessages = newMap.get(data.roomId) || [];

        const isDuplicate = roomMessages.some(
          (msg) => msg.id === messageWithUserId.id && msg.id !== undefined
        );

        if (isDuplicate) {
          console.log("ChatWindow: 중복 메시지 무시:", messageWithUserId.id);
          return prev;
        }

        const newMessages = [...roomMessages, messageWithUserId];
        newMessages.sort((a, b) => {
          const timeA = a.timestamp || new Date(a.time || 0).getTime();
          const timeB = b.timestamp || new Date(b.time || 0).getTime();
          return timeA - timeB;
        });
        newMap.set(data.roomId, newMessages);
        console.log(
          "ChatWindow: 메시지 추가됨, 방:",
          data.roomId,
          "총 메시지 수:",
          newMessages.length
        );
        return newMap;
      });
    };

    const handleSystemMessage = (data) => {
      const systemMsg = {
        ...data,
        type: "system",
        timestamp: new Date(data.time).getTime(),
      };

      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        const roomMessages = newMap.get(data.roomId) || [];
        const newMessages = [...roomMessages, systemMsg];
        newMessages.sort((a, b) => {
          const timeA = a.timestamp || new Date(a.time || 0).getTime();
          const timeB = b.timestamp || new Date(b.time || 0).getTime();
          return timeA - timeB;
        });
        newMap.set(data.roomId, newMessages);
        return newMap;
      });
    };

    const handleChatHistory = (messages) => {
      if (!Array.isArray(messages) || messages.length === 0) return;

      const roomId = messages[0]?.roomId;
      if (!roomId) return;

      setLeftRooms((prevLeftRooms) => {
        const isLeftRoom = prevLeftRooms.has(roomId);
        if (isLeftRoom) {
          console.log(
            "ChatWindow: 나간 방이므로 메시지 불러오지 않음, roomId:",
            roomId
          );
          return prevLeftRooms;
        }

        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);

          const historyMessages = messages.map((msg) => ({
            ...msg,
            type: "message",
            timestamp: new Date(msg.time).getTime(),
          }));

          const existingMessages = newMap.get(roomId) || [];
          const allMessages = [...existingMessages, ...historyMessages];

          const uniqueMessages = Array.from(
            new Map(
              allMessages.map((msg) => [
                msg.id ||
                  `${msg.roomId}-${msg.time}-${msg.userId}-${msg.message}`,
                msg,
              ])
            ).values()
          );

          uniqueMessages.sort((a, b) => {
            const timeA = a.timestamp || new Date(a.time || 0).getTime();
            const timeB = b.timestamp || new Date(b.time || 0).getTime();
            return timeA - timeB;
          });

          newMap.set(roomId, uniqueMessages);
          console.log(
            "ChatWindow: 채팅 히스토리 로드, roomId:",
            roomId,
            "메시지 수:",
            uniqueMessages.length
          );
          return newMap;
        });

        return prevLeftRooms;
      });
    };

    const handleError = (data) => {
      showError(data.message || "오류가 발생했습니다.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatMessage", handleChatMessage);
    socket.on("chatHistory", handleChatHistory);
    socket.on("systemMessage", handleSystemMessage);
    socket.on("error", handleError);

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
      socket.off("chatHistory", handleChatHistory);
      socket.off("systemMessage", handleSystemMessage);
      socket.off("error", handleError);
    };
  }, [socket, isOpen, currentRoom, activeTab, selectedUser, user, showError]);

  useEffect(() => {
    hasLeftRoomRef.current = hasLeftRoom;
  }, [hasLeftRoom]);

  useEffect(() => {
    if (!socket || !isOpen || !isConnected) return;

    if (hasLeftRoom || hasLeftRoomRef.current) {
      console.log("ChatWindow: 방 나가기 상태이므로 방 변경하지 않음");
      return;
    }

    if (activeTab === "private" && !selectedUser) {
      return;
    }

    const newRoom =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user.id, selectedUser.id)
        : currentRoom;

    if (currentJoinedRoom === newRoom) {
      return;
    }

    if (currentJoinedRoom && currentJoinedRoom !== newRoom) {
      const isCurrentRoomPrivate = currentJoinedRoom.startsWith("private-");
      const isNewRoomPrivate = newRoom.startsWith("private-");

      if (isCurrentRoomPrivate && isNewRoomPrivate) {
        console.log(
          "ChatWindow: 1:1 채팅 전환 - 퇴장 메시지 없이 전환, 이전 방:",
          currentJoinedRoom,
          "새 방:",
          newRoom
        );
      } else {
        socket.emit("leaveRoom", { roomId: currentJoinedRoom });
      }
    }

    setTimeout(
      () => {
        if (hasLeftRoomRef.current) {
          console.log(
            "ChatWindow: 방 입장 전 hasLeftRoom 확인 - 방 나가기 상태이므로 입장하지 않음"
          );
          return;
        }
        socket.emit("joinRoom", { roomId: newRoom });
        setCurrentJoinedRoom(newRoom);
        setHasLeftRoom(false);
      },
      currentJoinedRoom && currentJoinedRoom !== newRoom ? 100 : 0
    );
  }, [
    currentRoom,
    activeTab,
    selectedUser,
    socket,
    isOpen,
    isConnected,
    user,
    hasLeftRoom,
    currentJoinedRoom,
  ]);

  const handleLeaveRoom = () => {
    if (!socket || !isConnected || !selectedUser) {
      console.log("ChatWindow: 방 나가기 실패 - 조건 불만족", {
        hasSocket: !!socket,
        isConnected,
        hasSelectedUser: !!selectedUser,
      });
      return;
    }

    const roomId = getPrivateRoomId(user.id, selectedUser.id);
    console.log("ChatWindow: 방 나가기 시도, roomId:", roomId);

    if (
      window.confirm(
        "채팅방에서 나가시겠습니까? 나가면 대화 내용이 삭제됩니다."
      )
    ) {
      setHasLeftRoom(true);
      setCurrentJoinedRoom(null);

      socket.emit("leaveRoom", { roomId });
      console.log("ChatWindow: leaveRoom 이벤트 전송, roomId:", roomId);

      setLeftRooms((prev) => {
        const newSet = new Set(prev);
        newSet.add(roomId);
        console.log(
          "ChatWindow: 방 나가기 - 나간 방 목록에 추가, roomId:",
          roomId
        );
        return newSet;
      });

      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        console.log("ChatWindow: 방 나가기 - 메시지 삭제, roomId:", roomId);
        return newMap;
      });

      setActiveTab("public");
      setCurrentRoom("general");
      setSelectedUser(null);

      console.log("ChatWindow: 방 나가기 완료 - UI 상태 변경됨");
      success("채팅방에서 나갔습니다.");
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setHasLeftRoom(false);
  };

  const handleSelectUser = (selectedUserData) => {
    const roomId = getPrivateRoomId(user.id, selectedUserData.id);

    const wasLeft = hasLeftRoom && selectedUser?.id === selectedUserData.id;

    const isReturningToSameRoom = currentJoinedRoom === roomId && !wasLeft;

    if (wasLeft) {
      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        console.log(
          "ChatWindow: 나간 방 재선택 - 메시지 삭제, roomId:",
          roomId
        );
        return newMap;
      });
    }

    setSelectedUser(selectedUserData);
    setActiveTab("private");
    setHasLeftRoom(false);

    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      newMap.set(selectedUserData.id, roomId);
      return newMap;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !isConnected) {
      console.log("ChatWindow: 메시지 전송 실패 - 조건 불만족", {
        hasMessage: !!inputMessage.trim(),
        hasSocket: !!socket,
        isConnected,
      });
      return;
    }

    const roomId =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user.id, selectedUser.id)
        : currentRoom;

    console.log("ChatWindow: 메시지 전송 시도", {
      roomId,
      message: inputMessage,
      activeTab,
      selectedUser: selectedUser?.id,
    });

    socket.emit("chatMessage", {
      roomId: roomId,
      message: inputMessage,
    });

    setInputMessage("");
  };

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
    <div ref={chatWindowRef} className={`chat-window ${isOpen ? "open" : ""}`}>
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
          <button className="back-to-users" onClick={handleBackToList}>
            ← 목록
          </button>
          <button
            className="leave-room-button"
            onClick={handleLeaveRoom}
            title="채팅방 나가기 (대화 내용 삭제)"
          >
            방 나가기
          </button>
        </div>
      )}

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
                } ${
                  msg.type === "message" &&
                  (msg.userId === user?.id || msg.username === user?.name)
                    ? "own"
                    : ""
                }`}
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

      {process.env.NODE_ENV === "development" && socket && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            fontSize: "10px",
            color: "#999",
            background: "rgba(0,0,0,0.1)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          Socket: {socket.connected ? "연결됨" : "연결 안됨"} | ID:{" "}
          {socket.id || "없음"}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
