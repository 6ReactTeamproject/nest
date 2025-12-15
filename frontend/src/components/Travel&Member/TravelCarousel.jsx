import Slider from "react-slick";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/fetch";
import { API_BASE_URL } from "../../constants";
import "../../styles/travel.css";

export default function TravelCarousel() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    apiGet("semester/info")
      .then((res) => {
        const data = res.data ?? res;
        setItems(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 불러오기 실패:", err);
        setIsLoading(false);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  if (isLoading) return null;
  
  if (!items.length) return null;

  return (
    <div className="carousel-container">
      <h2>추천 여행지 ✈️</h2>
      <Slider {...settings}>
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-card"
            onClick={() => navigate(`/intro/${item.id}`)}
          >
            <img
              src={
                item.imageUrl
                  ? item.imageUrl.startsWith('http')
                    ? item.imageUrl
                    : `${API_BASE_URL}${item.imageUrl}`
                  : "https://placehold.co/600x400?text=No+Image"
              }
              alt={item.title || "이미지 없음"}
              className="carousel-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
            <div className="carousel-text">
              <h3>{item.title || "제목 없음"}</h3>
              <p>{item.description || "설명 없음"}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
