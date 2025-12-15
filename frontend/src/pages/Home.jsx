import "../styles/layout.css";
import TopPosts from "../components/Post/TopPosts";
import TravelCarousel from "../components/Travel&Member/TravelCarousel";

export default function Home() {
  return (
    <>
      <div className="home-container">
        <TravelCarousel />
      </div>

      <TopPosts />
    </>
  );
}
