import Header from "./Header";
import Footer from "./Footer";
import "../styles/layout.css";
import SidebarHome from "./SidebarHome";
import { ToastProvider } from "../components/common/Toast";

const Layout = ({ children }) => {
  return (
    <ToastProvider>
      <div className="layout-container">
        <Header />
        <SidebarHome />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default Layout;
