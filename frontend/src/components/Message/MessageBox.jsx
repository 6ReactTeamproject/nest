import { useState, useEffect, useRef } from "react";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";
import MessageForm from "./MessageForm";
import { MESSAGES } from "../../constants";
import "./Message.css";
import { useNavigate } from "react-router-dom";

const MessageBox = () => {
  const { user } = useUser();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("received");
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const nav = useNavigate();
  const { error: showError } = useToast();
  const hasRedirected = useRef(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // localStorage에서 토큰 확인
    const accessToken = localStorage.getItem("access_token");
    
    // 토큰이 없으면 즉시 리다이렉트
    if (!accessToken && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsCheckingAuth(false);
      showError(MESSAGES.LOGIN_NEEDED);
      nav("/login");
      return;
    }

    // 토큰이 있으면 사용자 정보가 로드될 때까지 기다림
    if (accessToken) {
      // 사용자 정보가 로드되면 인증 확인 완료
      if (user) {
        setIsCheckingAuth(false);
        hasRedirected.current = false;
      } else {
        // 사용자 정보가 아직 로드되지 않았으면 잠시 기다림
        // main.jsx의 useEffect가 실행될 시간을 줌
        const timer = setTimeout(() => {
          setIsCheckingAuth(false);
          // 사용자 정보가 여전히 없으면 리다이렉트
          if (!user && !hasRedirected.current) {
            hasRedirected.current = true;
            showError(MESSAGES.LOGIN_NEEDED);
            nav("/login");
          }
        }, 200); // main.jsx의 useEffect가 실행될 시간을 줌
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, nav, showError]);

  // 메시지 전송 후 목록 새로고침
  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1);
    // 선택된 메시지도 새로고침 (읽음 상태 업데이트 반영)
    if (selectedMessage) {
      // selectedMessage를 null로 설정했다가 다시 설정하여 MessageDetail이 리렌더링되도록 함
      // 실제로는 MessageList가 다시 로드되면서 selectedMessage도 업데이트됨
      setSelectedMessage(null);
    }
  };

  // 인증 확인 중이면 로딩 표시
  if (isCheckingAuth) {
    return <div className="message-box">{MESSAGES.LOADING}</div>;
  }

  // 사용자가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!user) {
    return null;
  }

  return (
    <div className="message-box">
      {/* 상단 헤더: 탭과 쪽지 작성 버튼 */}
      <div className="message-header">
        <div className="message-tabs">
          {/* 받은 쪽지 탭 */}
          <button
            className={activeTab === "received" ? "active" : ""}
            onClick={() => {
              setActiveTab("received");    // 받은 쪽지 탭 활성화
              setSelectedMessage(null);    // 메시지 선택 초기화
            }}
          >
            받은 쪽지
          </button>
          {/* 보낸 쪽지 탭 */}
          <button
            className={activeTab === "sent" ? "active" : ""}
            onClick={() => {
              setActiveTab("sent");
              setSelectedMessage(null);
            }}
          >
            보낸 쪽지
          </button>
        </div>
        {/* 쪽지 작성 버튼 */}
        <button
          className="write-button"
          onClick={() => {
            setShowForm(true);
            setSelectedMessage(null);
          }}
        >
          쪽지 작성
        </button>
      </div>

      {/* 메시지 목록과 상세 영역 */}
      <div className="message-container">
        {/* 메시지 리스트 컴포넌트: 탭, 선택 메시지, 폼 상태 전달 */}
        <div className="message-list-container">
          <MessageList
            key={refreshKey}               // refreshKey가 바뀌면 리렌더링
            activeTab={activeTab}
            onSelectMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
            showForm={showForm}
            onMessageUpdate={(updatedMessage) => {
              // 선택된 메시지가 업데이트된 경우 selectedMessage도 업데이트
              if (selectedMessage && selectedMessage.id === updatedMessage.id) {
                setSelectedMessage(updatedMessage);
              }
            }}
          />
        </div>

        {/* 메시지 상세보기 혹은 작성폼 영역 */}
        <div className="message-detail-container">
          {showForm ? (
            // 쪽지 작성 폼
            <MessageForm onClose={() => setShowForm(false)} />
          ) : selectedMessage ? (
            // 선택된 메시지 상세보기
            <MessageDetail
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
              onMessageSent={handleMessageSent}
            />
          ) : (
            // 아무 메시지도 선택하지 않은 경우 안내 메시지
            <div className="no-selection">
              {activeTab === "received" ? "받은" : "보낸"} 쪽지를 선택해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
