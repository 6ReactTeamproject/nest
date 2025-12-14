/**
 * 라우팅 히스토리 관리 훅
 * React Router의 라우팅 히스토리를 추적하고 관리합니다.
 * 
 * 왜 필요한가?
 * - 로그인 사용자 보호: 로그인한 사용자가 뒤로가기로 로그인/회원가입 페이지에 접근하는 것을 방지
 * - 히스토리 추적: 사용자가 방문한 경로를 추적하여 적절한 페이지로 리다이렉트
 * - 사용자 경험 향상: 로그인 후 이전 페이지로 돌아가거나 로그인 페이지 접근 방지
 */

import { useEffect, useRef } from "react";
import { useLocation, useNavigationType, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export const useRouteHistory = () => {
  // 현재 URL 정보 가져오기
  const location = useLocation();
  // 이동 유형: PUSH (새 페이지), REPLACE (현재 페이지 교체), POP (뒤로/앞으로 이동)
  const navType = useNavigationType();
  // 페이지 이동 함수
  const nav = useNavigate();
  // 로그인한 사용자 정보
  const user = useUser();
  // 단순 방문 경로 기록용 ref (사용되지 않지만 필요시 사용 가능)
  const routeHistory = useRef([]);
  // 커스텀 히스토리 스택 관리용 ref
  // 왜 ref를 사용하나? 컴포넌트 리렌더링 시에도 값이 유지되도록 하기 위해
  const customHistory = useRef({
    entries: [],                             // 방문한 경로 목록 배열
    index: -1,                              // 현재 위치 인덱스 초기값 -1
  });

  useEffect(() => {
    // 최초 렌더링 시, 히스토리가 비어있으면 현재 경로 추가 후 인덱스 0으로 세팅
    if (customHistory.current.index === -1) {
      customHistory.current.entries.push(location.pathname);
      customHistory.current.index = 0;
    } else {
      // 네비게이션 타입에 따라 커스텀 히스토리 업데이트
      switch (navType) {
        case "PUSH":
          // PUSH 시 기존 현재 인덱스 이후 히스토리 삭제 후 새 경로 추가
          customHistory.current.entries = customHistory.current.entries.slice(
            0,
            customHistory.current.index + 1
          );
          customHistory.current.entries.push(location.pathname);
          customHistory.current.index++;  // 인덱스 1 증가
          break;
        case "REPLACE":
          // 현재 인덱스 위치의 경로를 새 경로로 교체
          customHistory.current.entries[customHistory.current.index] =
            location.pathname;
          break;
        case "POP": {
          // POP (뒤로/앞으로 이동) 시 히스토리 내 경로 위치 찾아 인덱스 갱신
          const idx = customHistory.current.entries.indexOf(location.pathname);
          if (idx !== -1) {
            // 히스토리 내 경로가 존재하면 인덱스 갱신
            customHistory.current.index = idx;
          } else {
            // 없으면 새로 추가 후 인덱스 마지막으로 설정
            customHistory.current.entries.push(location.pathname);
            customHistory.current.index =
              customHistory.current.entries.length - 1;
          }
          break;
        }
        default:
          break;
      }
    }

    // 로그인 상태일 때 POP으로 로그인/회원가입 페이지 접근 시
    if (user) {
      if (
        navType === "POP" &&
        ["/login", "/signup"].includes(location.pathname)
      ) {
        // 로그인/회원가입 페이지가 연속으로 여러개 있을 수 있으니
        // 그 전 정상 페이지로 이동하기 위해 반복문으로 탐색
        let i = customHistory.current.index;
        while (
          i > 0 &&
          ["/login", "/signup"].includes(customHistory.current.entries[i])
        ) {
          i--;
        }
        if (i >= 0) {
          // 정상 페이지가 발견되면 해당 경로로 강제 리다이렉트(뒤로가기 방지)
          const target = customHistory.current.entries[i];
          customHistory.current.index = i;
          nav(target, { replace: true });
          return;  // 이후 코드 실행 중단
        }
      }
    }

    // 로그인/회원가입 페이지 제외한 경로는 세션에 마지막 방문 경로로 저장
    const publicPaths = ["/login", "/signup"];
    if (!publicPaths.includes(location.pathname)) {
      sessionStorage.setItem("lastPublicPath", location.pathname);
    }

    // 단순 방문 경로 기록 배열에 현재 경로 추가 (중복 가능)
    routeHistory.current.push(location.pathname);
  }, [location, navType, nav, user]);

  // 반환값이 사용되지 않지만, 필요시 사용할 수 있도록 유지
  // return { routeHistory, customHistory };
};
