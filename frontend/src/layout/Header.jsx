import { Link } from "react-router-dom";
import { UserSection } from "../components/common/UserSection";
import "../styles/layout.css";

const Header = () => {
  return (
  <header className="header">
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
