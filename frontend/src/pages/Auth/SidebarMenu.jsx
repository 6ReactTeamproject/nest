import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/sidebar.css"

export default function SidebarMenu({ menuItems }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = item.path === "/post"
            ? location.pathname.startsWith("/post")
            : location.pathname === item.path;

          return (
            <div
              key={item.path}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
