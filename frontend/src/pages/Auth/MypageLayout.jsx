import MypageSidebar from "./MypageSidebar";
import "../../styles/Mypage.css"

export default function MypageLayout({ children }) {
  return (
    // 마이페이지 전체 레이아웃을 감싸는 컨테이너
    <div className="mypage-container">
      {/* 왼쪽 사이드바 (쪽지함, 닉네임 변경, 비밀번호 변경 등 메뉴) */}
      <MypageSidebar />
      
      {/* 오른쪽 메인 콘텐츠 영역 */}
      <div className="mypage-main">
        {children} {/* 자식 컴포넌트들이 여기에 표시됨 (닉네임/비밀번호 변경 폼 등) */}
      </div>
    </div>
  );
}
