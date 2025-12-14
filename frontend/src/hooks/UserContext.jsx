/**
 * 사용자 Context 모듈
 * 전역 사용자 상태를 관리하는 React Context입니다.
 * 
 * 왜 필요한가?
 * - 전역 상태 관리: 사용자 정보를 전역으로 관리하여 어디서나 접근 가능
 * - Prop Drilling 방지: 여러 컴포넌트를 거쳐 props를 전달할 필요 없음
 * - 로그인 상태 추적: 현재 로그인한 사용자 정보를 쉽게 확인
 * - 상태 업데이트: 로그인/로그아웃 시 전역 상태 업데이트
 */

import { createContext, useContext } from "react";

// UserContext 생성: 사용자 정보와 setUser 함수를 기본값으로 가짐
// 왜 Context를 사용하나? 여러 컴포넌트에서 사용자 정보를 쉽게 접근하기 위해
export const UserContext = createContext({
  user: null,       // 현재 로그인한 사용자 정보 (없으면 null)
  setUser: () => {}, // 사용자 정보를 갱신하는 함수
});

/**
 * useUser 훅
 * UserContext에 접근하기 위한 커스텀 훅입니다.
 * 
 * 왜 필요한가?
 * - 편리한 사용: 컴포넌트에서 useContext를 직접 호출하지 않고 간단하게 사용
 * - 코드 일관성: 모든 컴포넌트에서 동일한 방식으로 사용자 정보 접근
 * 
 * @returns {Object} { user, setUser } - 사용자 정보와 업데이트 함수
 */
export const useUser = () => useContext(UserContext);
