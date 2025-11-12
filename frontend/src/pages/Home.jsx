import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/UserContext";
import "../styles/layout.css";
import TopPosts from "../components/Post/TopPosts";
import TravelCarousel from "../components/Travel&Member/TravelCarousel";

export default function Home() {
  const navigate = useNavigate();
  const { user: currentUser } = useUser(); // 현재 로그인한 사용자 정보 가져오기

  return (
    <>
      {console.log(currentUser)} {/* 콘솔에 사용자 정보 출력 (디버깅 용도) */}

      {/* 홈 화면 상단에 여행 장소 캐러셀 표시 */}
      <div className="home-container">
        <TravelCarousel />
      </div>

      {/* 하단에 인기 게시글 목록 표시 */}
      <TopPosts />
    </>
  );
}
