import { createContext, useContext } from "react";

// UserContext 생성: 사용자 정보와 setUser 함수를 기본값으로 가짐
export const UserContext = createContext({
  user: null,       // 현재 로그인한 사용자 정보 없으면 null
  setUser: () => {}, // 사용자 정보를 갱신
});

export const useUser = () => useContext(UserContext);
