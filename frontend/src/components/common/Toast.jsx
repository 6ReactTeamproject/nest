import { useState, useEffect, createContext, useContext, useCallback } from "react";
import "../../styles/toast.css";

// Toast Context 생성
const ToastContext = createContext(null);

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message) => showToast(message, "success"), [showToast]);
  const error = useCallback((message) => showToast(message, "error"), [showToast]);
  const info = useCallback((message) => showToast(message, "info"), [showToast]);
  const warning = useCallback((message) => showToast(message, "warning"), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// 토스트 메시지 컴포넌트
function Toast({ message, type = "info", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} className="toast-close">
        ×
      </button>
    </div>
  );
}

// 토스트 컨테이너
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// 토스트 훅
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Context가 없을 때 기본 구현 제공 (fallback)
    return {
      toasts: [],
      showToast: () => {},
      removeToast: () => {},
      success: (msg) => alert(msg),
      error: (msg) => alert(msg),
      info: (msg) => alert(msg),
      warning: (msg) => alert(msg),
    };
  }
  return context;
}
