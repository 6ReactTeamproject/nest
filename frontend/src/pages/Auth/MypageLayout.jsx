import MypageSidebar from "./MypageSidebar";
import "../../styles/Mypage.css"

export default function MypageLayout({ children }) {
  return (
    <div className="mypage-container">
      <MypageSidebar />
      
      <div className="mypage-main">
        {children}
      </div>
    </div>
  );
}
