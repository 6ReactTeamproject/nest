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

  useEffect(() => {
    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      showError(MESSAGES.LOGIN_NEEDED);
      nav("/login");
    } else if (user) {
      hasRedirected.current = false;
    }
  }, [user, nav]);

  // 메시지 전송 후 목록 새로고침
  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
