import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/sidebar.css"

// 사이드바 메뉴를 렌더링하는 컴포넌트
export default function SidebarMenu({ menuItems }) {
  const location = useLocation();  // 현재 URL 경로를 가져옴
  const navigate = useNavigate();  // 프로그래밍 방식으로 페이지 이동

  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          // 현재 페이지와 메뉴 경로를 비교하여 활성 상태 여부 결정
          const isActive = item.path === "/post"
            ? location.pathname.startsWith("/post") // 게시글 상세 페이지들 포함
            : location.pathname === item.path;

          return (
            <div
              key={item.path}
              className={`sidebar-item ${isActive ? "active" : ""}`} // 현재 경로면 active 클래스 추가
              onClick={() => navigate(item.path)} // 클릭 시 해당 경로로 이동
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
