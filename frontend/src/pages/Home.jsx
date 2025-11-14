import "../styles/layout.css";
import TopPosts from "../components/Post/TopPosts";
import TravelCarousel from "../components/Travel&Member/TravelCarousel";

export default function Home() {
  return (
    <>
      {/* 홈 화면 상단에 여행 장소 캐러셀 표시 */}
      <div className="home-container">
        <TravelCarousel />
      </div>

      {/* 하단에 인기 게시글 목록 표시 */}
      <TopPosts />
    </>
  );
}
