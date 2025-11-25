import { useState, useEffect, useRef, useMemo } from "react";
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
  const [messagesByRoom, setMessagesByRoom] = useState(new Map()); // roomId -> message[]
  const [inputMessage, setInputMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  const [rooms] = useState(["general", "travel", "food"]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("public"); // "public" or "private"
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateChats, setPrivateChats] = useState(new Map()); // userId -> roomId
  const [hasLeftRoom, setHasLeftRoom] = useState(false); // 방을 완전히 나갔는지 여부
  const [currentJoinedRoom, setCurrentJoinedRoom] = useState(null); // 현재 입장한 방 추적
  const [leftRooms, setLeftRooms] = useState(new Set()); // 나간 방 목록 (메시지 불러오지 않음)
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const hasLeftRoomRef = useRef(false); // hasLeftRoom의 최신 값을 추적
  const { error: showError, success } = useToast();

  // 1:1 채팅방 ID 생성 (항상 같은 순서로 정렬하여 일관성 유지)
  const getPrivateRoomId = (userId1, userId2) => {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `private-${sorted[0]}-${sorted[1]}`;
  };

  // 현재 방의 메시지 가져오기 (상태 변경 시 자동 재계산)
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
        // 방 입장은 방 변경 useEffect에서 처리
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
      setHasLeftRoom(false); // 연결 시 방 나가기 상태 초기화
      // 방 입장은 방 변경 useEffect에서 처리 (중복 방지)
    };

    const handleDisconnect = (reason) => {
      console.log("ChatWindow: 소켓 연결 해제:", reason);
      setIsConnected(false);
    };

    const handleChatMessage = (data) => {
      console.log("ChatWindow: 메시지 수신:", data);

      // roomId가 없으면 에러
      if (!data.roomId) {
        console.error("ChatWindow: roomId가 없습니다:", data);
        return;
      }

      // 메시지에 userId 추가 (내 메시지인지 구분하기 위해)
      const messageWithUserId = {
        ...data,
        type: "message",
        userId: data.userId || null,
        timestamp: new Date(data.time).getTime(), // 시간순 정렬을 위한 타임스탬프
      };

      // 해당 방의 메시지에 추가
      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        const roomMessages = newMap.get(data.roomId) || [];

        // 중복 체크 (같은 id가 이미 있으면 추가하지 않음)
        const isDuplicate = roomMessages.some(
          (msg) => msg.id === messageWithUserId.id && msg.id !== undefined
        );

        if (isDuplicate) {
          console.log("ChatWindow: 중복 메시지 무시:", messageWithUserId.id);
          return prev; // 중복이면 기존 상태 유지
        }

        const newMessages = [...roomMessages, messageWithUserId];
        // 시간순으로 정렬
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
      // 시스템 메시지는 시간순으로 정렬되도록 시간 정보 추가
      const systemMsg = {
        ...data,
        type: "system",
        timestamp: new Date(data.time).getTime(),
      };

      // 해당 방의 메시지에 추가
      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        const roomMessages = newMap.get(data.roomId) || [];
        const newMessages = [...roomMessages, systemMsg];
        // 시간순으로 정렬
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
      // 기존 메시지 히스토리를 받아서 해당 방의 메시지에 추가
      if (!Array.isArray(messages) || messages.length === 0) return;

      // 첫 번째 메시지의 roomId를 사용 (모든 메시지는 같은 방에 속함)
      const roomId = messages[0]?.roomId;
      if (!roomId) return;

      // 나간 방 목록 확인 (함수형 업데이트로 최신 상태 확인)
      setLeftRooms((prevLeftRooms) => {
        const isLeftRoom = prevLeftRooms.has(roomId);
        if (isLeftRoom) {
          console.log(
            "ChatWindow: 나간 방이므로 메시지 불러오지 않음, roomId:",
            roomId
          );
          return prevLeftRooms; // 상태는 변경하지 않음
        }

        // 나간 방이 아니면 메시지 추가
        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);

          // 히스토리 메시지를 변환
          const historyMessages = messages.map((msg) => ({
            ...msg,
            type: "message",
            timestamp: new Date(msg.time).getTime(),
          }));

          // 기존 메시지와 히스토리 메시지를 합치고 중복 제거 (id 기준)
          const existingMessages = newMap.get(roomId) || [];
          const allMessages = [...existingMessages, ...historyMessages];

          // id를 기준으로 중복 제거 (id가 있으면 id 사용, 없으면 고유 키 생성)
          const uniqueMessages = Array.from(
            new Map(
              allMessages.map((msg) => [
                msg.id ||
                  `${msg.roomId}-${msg.time}-${msg.userId}-${msg.message}`,
                msg,
              ])
            ).values()
          );

          // 시간순으로 정렬
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

        return prevLeftRooms; // 상태는 변경하지 않음
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
      socket.off("chatHistory", handleChatHistory);
      socket.off("systemMessage", handleSystemMessage);
      socket.off("error", handleError);
    };
  }, [socket, isOpen, currentRoom, activeTab, selectedUser, user, showError]);

  // hasLeftRoom 상태 변경 시 ref 업데이트
  useEffect(() => {
    hasLeftRoomRef.current = hasLeftRoom;
  }, [hasLeftRoom]);

  // 방 변경 시 (공개 방 또는 1:1 채팅)
  useEffect(() => {
    if (!socket || !isOpen || !isConnected) return;

    // 방 나가기 상태이면 방 변경하지 않음 (가장 먼저 확인)
    if (hasLeftRoom || hasLeftRoomRef.current) {
      console.log("ChatWindow: 방 나가기 상태이므로 방 변경하지 않음");
      return;
    }

    // 1:1 채팅에서 selectedUser가 null이면 방 변경하지 않음 (목록으로 돌아간 상태)
    if (activeTab === "private" && !selectedUser) {
      return;
    }

    // 현재 입장해야 할 방
    const newRoom =
      activeTab === "private" && selectedUser
        ? getPrivateRoomId(user.id, selectedUser.id)
        : currentRoom;

    // 이미 같은 방에 있으면 입장하지 않음 (메시지도 유지)
    if (currentJoinedRoom === newRoom) {
      return;
    }

    // 이전 방이 있으면 나가기
    // 단, 1:1 채팅에서 다른 1:1 채팅으로 전환할 때는 퇴장 메시지를 보내지 않음
    if (currentJoinedRoom && currentJoinedRoom !== newRoom) {
      const isCurrentRoomPrivate = currentJoinedRoom.startsWith("private-");
      const isNewRoomPrivate = newRoom.startsWith("private-");

      // 둘 다 1:1 채팅방이면 퇴장 메시지 없이 조용히 전환
      if (isCurrentRoomPrivate && isNewRoomPrivate) {
        console.log(
          "ChatWindow: 1:1 채팅 전환 - 퇴장 메시지 없이 전환, 이전 방:",
          currentJoinedRoom,
          "새 방:",
          newRoom
        );
        // leaveRoom을 emit하지 않고 조용히 전환
      } else {
        // 공개방 <-> 1:1 채팅 전환이거나 공개방 간 전환일 때만 퇴장 메시지 전송
        socket.emit("leaveRoom", { roomId: currentJoinedRoom });
      }
    }

    // 새 방 입장
    setTimeout(
      () => {
        // 다시 한 번 hasLeftRoom 확인 (ref로 최신 값 확인)
        if (hasLeftRoomRef.current) {
          console.log(
            "ChatWindow: 방 입장 전 hasLeftRoom 확인 - 방 나가기 상태이므로 입장하지 않음"
          );
          return;
        }
        socket.emit("joinRoom", { roomId: newRoom });
        setCurrentJoinedRoom(newRoom); // 현재 입장한 방 저장
        // 메시지는 방별로 저장되므로 초기화할 필요 없음
        setHasLeftRoom(false); // 새 방 입장 시 상태 초기화
      },
      currentJoinedRoom && currentJoinedRoom !== newRoom ? 100 : 0
    ); // 이전 방이 없거나 같으면 즉시 입장
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

  // 방 완전히 나가기 (카카오톡처럼 대화 내용 삭제)
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
      // 먼저 상태를 설정하여 useEffect가 다시 입장하지 않도록 함
      setHasLeftRoom(true);
      setCurrentJoinedRoom(null); // 현재 입장한 방 초기화

      // 방에서 나가기
      socket.emit("leaveRoom", { roomId });
      console.log("ChatWindow: leaveRoom 이벤트 전송, roomId:", roomId);

      // 나간 방 목록에 추가
      setLeftRooms((prev) => {
        const newSet = new Set(prev);
        newSet.add(roomId);
        console.log(
          "ChatWindow: 방 나가기 - 나간 방 목록에 추가, roomId:",
          roomId
        );
        return newSet;
      });

      // 해당 방의 메시지 완전히 삭제
      setMessagesByRoom((prev) => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        console.log("ChatWindow: 방 나가기 - 메시지 삭제, roomId:", roomId);
        return newMap;
      });

      // UI 상태 변경 - 모든 상태를 한 번에 변경
      // 순서: activeTab을 먼저 변경하여 useEffect가 private 탭을 인식하지 않도록
      // 그리고 selectedUser를 null로 설정하여 채팅방 UI가 사라지도록
      setActiveTab("public");
      setCurrentRoom("general");
      // selectedUser를 null로 설정하여 채팅방 헤더와 메시지 영역이 사라지도록
      setSelectedUser(null);

      console.log("ChatWindow: 방 나가기 완료 - UI 상태 변경됨");
      success("채팅방에서 나갔습니다.");
    }
  };

  // 목록으로 돌아가기 (대화 내용 유지, 방에는 계속 남아있음)
  const handleBackToList = () => {
    // 방에서 나가지 않고, 메시지도 유지
    // selectedUser만 null로 설정하여 사용자 목록으로 돌아감
    setSelectedUser(null);
    setHasLeftRoom(false);
    // currentJoinedRoom은 유지 (방에 계속 남아있음)
    // 메시지는 유지됨 (setMessages 호출 안 함)
    // 방도 그대로 유지됨 (leaveRoom 호출 안 함)
  };

  // 사용자 선택 시 1:1 채팅방 생성 또는 재입장
  const handleSelectUser = (selectedUserData) => {
    const roomId = getPrivateRoomId(user.id, selectedUserData.id);

    // 이전에 나간 방인지 확인
    const wasLeft = hasLeftRoom && selectedUser?.id === selectedUserData.id;

    // 같은 사용자를 다시 선택한 경우 (목록에서 돌아온 경우)
    // currentJoinedRoom과 비교하여 같은 방이면 메시지 유지
    const isReturningToSameRoom = currentJoinedRoom === roomId && !wasLeft;

    // 나간 방을 다시 선택한 경우 메시지 삭제 (leftRooms는 유지하여 이전 메시지가 다시 불러와지지 않도록)
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
      // leftRooms에서 제거하지 않음 - 이전 메시지가 다시 불러와지지 않도록
    }

    setSelectedUser(selectedUserData);
    setActiveTab("private");
    setHasLeftRoom(false);

    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      newMap.set(selectedUserData.id, roomId);
      return newMap;
    });

    // 방 입장은 useEffect에서 처리 (중복 방지)
    // 나간 방이거나 새 사용자면 메시지 초기화
    if (wasLeft || !isReturningToSameRoom) {
      // useEffect에서 방 입장 시 메시지가 초기화되므로 여기서는 처리하지 않음
    }
    // 같은 방으로 돌아오는 경우는 메시지 유지 (useEffect에서 currentJoinedRoom === newRoom이면 return)
  };

  // 메시지 전송
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
