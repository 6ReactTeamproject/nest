import Header from "./Header";
import Footer from "./Footer";
import "../styles/layout.css";
import SidebarHome from "./SidebarHome";

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Header />
      <SidebarHome />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
