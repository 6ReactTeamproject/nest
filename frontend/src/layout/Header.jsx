import { Link } from "react-router-dom";
import { UserSection } from "../components/common/UserSection";
import "../styles/layout.css";

const Header = () => {
  return (
    // 상단 헤더 영역, 전달받은 style과 클래스명 적용
  <header className="header">
    {/* 로고 및 홈 링크 */}
  <Link to="/" className="logo">
    <h1 className="header-title">현지학기제 카페</h1>
  </Link>
  <div className="header-right">
    <UserSection />
  </div>
  </header>
  );
};

export default Header;
