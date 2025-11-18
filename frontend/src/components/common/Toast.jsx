/**
 * Toast 알림 시스템
 * 사용자에게 성공, 에러, 정보 등의 메시지를 표시하는 알림 시스템입니다.
 * 
 * 왜 필요한가?
 * - 사용자 피드백: 작업 성공/실패를 사용자에게 알림
 * - 일관된 UI: 모든 알림이 동일한 스타일과 동작을 가짐
 * - 자동 사라짐: 일정 시간 후 자동으로 사라져 사용자 경험 향상
 * - 전역 사용: Context API를 통해 어디서나 사용 가능
 */

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import "../../styles/toast.css";

// Toast Context 생성
// 왜 Context를 사용하나? 전역에서 Toast를 사용할 수 있게 하기 위해
const ToastContext = createContext(null);

/**
 * Toast Provider 컴포넌트
 * Toast 기능을 제공하는 Context Provider입니다.
 * 
 * 왜 필요한가?
 * - 전역 상태 관리: Toast 목록을 전역으로 관리
 * - 함수 제공: showToast, removeToast 등의 함수를 전역으로 제공
 * - 자동 렌더링: ToastContainer를 자동으로 렌더링
 */
export function ToastProvider({ children }) {
  // Toast 목록 상태 관리
  // 왜 배열인가? 여러 Toast를 동시에 표시할 수 있으므로
  const [toasts, setToasts] = useState([]);

  /**
   * Toast 표시 함수
   * 새로운 Toast를 추가합니다.
   * 
   * 왜 필요한가? 컴포넌트에서 Toast를 쉽게 표시할 수 있게 함
   */
  const showToast = useCallback((message, type = "info", duration = 3000) => {
    // 고유 ID 생성: Date.now() + Math.random()으로 중복 방지
    // 왜 필요한가? 각 Toast를 고유하게 식별하기 위해
    const id = Date.now() + Math.random();
    // Toast 목록에 추가
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  /**
   * Toast 제거 함수
   * 지정된 ID의 Toast를 제거합니다.
   * 
   * 왜 필요한가? Toast가 사라질 때 목록에서 제거하기 위해
   */
  const removeToast = useCallback((id) => {
    // filter: 해당 ID를 제외한 Toast만 남김
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 편의 함수들: 각 타입별로 Toast를 쉽게 표시
  // useCallback: 불필요한 리렌더링 방지
  const success = useCallback((message) => showToast(message, "success"), [showToast]);
  const error = useCallback((message) => showToast(message, "error"), [showToast]);
  const info = useCallback((message) => showToast(message, "info"), [showToast]);
  const warning = useCallback((message) => showToast(message, "warning"), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
      {/* ToastContainer: 실제 Toast 메시지를 렌더링하는 컴포넌트 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * 개별 Toast 메시지 컴포넌트
 * 하나의 Toast 메시지를 표시합니다.
 * 
 * 왜 필요한가?
 * - 메시지 표시: 사용자에게 메시지를 보여줌
 * - 자동 사라짐: 일정 시간 후 자동으로 사라짐
 * - 애니메이션: 나타나고 사라지는 애니메이션 효과
 */
function Toast({ message, type = "info", duration = 3000, onClose }) {
  // 표시 여부 상태: 애니메이션을 위한 상태
  // 왜 필요한가? 사라지는 애니메이션을 위해 먼저 isVisible을 false로 설정
  const [isVisible, setIsVisible] = useState(true);

  /**
   * 자동 사라짐 효과
   * 지정된 시간 후 Toast를 자동으로 숨깁니다.
   * 
   * 왜 필요한가? Toast가 계속 화면에 남아있지 않도록 자동으로 제거
   */
  useEffect(() => {
    // setTimeout: 지정된 시간 후 실행
    const timer = setTimeout(() => {
      setIsVisible(false); // 먼저 숨김 (애니메이션 시작)
      // 300ms 후 완전히 제거 (애니메이션 완료 후)
      // 왜 300ms인가? CSS 애니메이션 시간과 맞추기 위해
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);

    // cleanup: 컴포넌트가 언마운트되면 타이머 정리
    // 왜 필요한가? 메모리 누수 방지
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 숨겨진 상태면 렌더링하지 않음
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

/**
 * Toast 컨테이너 컴포넌트
 * 모든 Toast 메시지를 렌더링하는 컨테이너입니다.
 * 
 * 왜 필요한가?
 * - 여러 Toast 표시: 여러 Toast를 동시에 표시할 수 있게 함
 * - 위치 관리: Toast들이 화면의 특정 위치에 표시되도록 관리
 * - 자동 정리: Toast가 사라질 때 자동으로 제거
 */
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {/* map: Toast 목록을 순회하며 각 Toast를 렌더링 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id} // 고유 키: React가 각 Toast를 구분하기 위해
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)} // 닫힐 때 목록에서 제거
        />
      ))}
    </div>
  );
}

/**
 * Toast 훅
 * 컴포넌트에서 Toast 기능을 사용할 수 있게 하는 커스텀 훅입니다.
 * 
 * 왜 필요한가?
 * - 편리한 사용: 컴포넌트에서 Toast를 쉽게 사용할 수 있게 함
 * - Context 접근: ToastContext에 접근하는 간편한 방법 제공
 * - Fallback 제공: Context가 없을 때 기본 구현 제공 (에러 방지)
 * 
 * @returns {Object} Toast 관련 함수들 (success, error, info, warning 등)
 */
export function useToast() {
  // ToastContext에서 값 가져오기
  const context = useContext(ToastContext);
  
  // Context가 없을 때 기본 구현 제공 (fallback)
  // 왜 필요한가? ToastProvider가 없어도 에러가 발생하지 않도록
  if (!context) {
    return {
      toasts: [],
      showToast: () => {},
      removeToast: () => {},
      // alert를 사용한 기본 구현: ToastProvider가 없을 때 사용
      success: (msg) => alert(msg),
      error: (msg) => alert(msg),
      info: (msg) => alert(msg),
      warning: (msg) => alert(msg),
    };
  }
  return context;
}
