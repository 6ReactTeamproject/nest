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
    const accessToken = localStorage.getItem("access_token");
    
    if (!accessToken && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsCheckingAuth(false);
      showError(MESSAGES.LOGIN_NEEDED);
      nav("/login");
      return;
    }

    if (accessToken) {
      if (user) {
        setIsCheckingAuth(false);
        hasRedirected.current = false;
      } else {
        const timer = setTimeout(() => {
          setIsCheckingAuth(false);
          if (!user && !hasRedirected.current) {
            hasRedirected.current = true;
            showError(MESSAGES.LOGIN_NEEDED);
            nav("/login");
          }
        }, 200);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, nav, showError]);

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1);
    if (selectedMessage) {
      setSelectedMessage(null);
    }
  };

  if (isCheckingAuth) {
    return <div className="message-box">{MESSAGES.LOADING}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="message-box">
      <div className="message-header">
        <div className="message-tabs">
          <button
            className={activeTab === "received" ? "active" : ""}
            onClick={() => {
              setActiveTab("received");
              setSelectedMessage(null);
            }}
          >
            받은 쪽지
          </button>
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

      <div className="message-container">
        <div className="message-list-container">
          <MessageList
            key={refreshKey}
            activeTab={activeTab}
            onSelectMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
            showForm={showForm}
            onMessageUpdate={(updatedMessage) => {
              if (selectedMessage && selectedMessage.id === updatedMessage.id) {
                setSelectedMessage(updatedMessage);
              }
            }}
          />
        </div>

        <div className="message-detail-container">
          {showForm ? (
            <MessageForm onClose={() => setShowForm(false)} />
          ) : selectedMessage ? (
            <MessageDetail
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
              onMessageSent={handleMessageSent}
            />
          ) : (
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
