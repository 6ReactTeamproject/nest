import { useNavigate } from "react-router-dom";
import "../../styles/travel.css";
import { useUser } from "../../hooks/UserContext";
import { useEffect, useState } from "react";
import { apiGet } from "../../api/fetch";
import HandleAuth from "../common/HandleAuth";

export default function IntroList({
  heading,
  endpoint,
  primaryKey,
  secondaryKey,
  imageKey,
  pathPrefix,
}) {
  const [items, setItems] = useState([]); // 받아온 데이터 저장 상태
    const navigate = useNavigate(); // 페이지 이동용 훅
    const { user } = useUser(); // 로그인 유저 정보

  // 기본 이미지
  const DEFAULT_PROFILE = "https://placehold.co/48x48?text=No+Img&font=roboto";

  useEffect(() => {
    apiGet(endpoint)
      .then((data) => setItems(data))
      .catch((err) => console.error("데이터 불러오기 실패:", err));
  }, [endpoint]);

  return (
    <div
      className={`page-container ${
        pathPrefix === "intro" ? "travel-intro" : "member-intro"
      }`}
    >
      <div className="intro-header">
        <h1>{heading}</h1> {/* 제목 표시 */}
      </div>
      <div className="travel-grid">
        {/* 받아온 아이템들을 카드 형식으로 렌더링 */}
        {items.map((item) => (
          <div
            key={item.id}
            className="travel-card"
            onClick={() => navigate(`/${pathPrefix}/${item.id}`)} // 클릭 시 상세 페이지 이동
          >
            <img
              src={item[imageKey] ? item[imageKey] : DEFAULT_PROFILE} // 이미지가 없으면 기본 이미지
              alt={item[primaryKey]} // 이미지 대체 텍스트
              onError={(e) => {
                e.target.onerror = null; // 무한 루프 방지
                e.target.src = DEFAULT_PROFILE; // 로딩 실패 시 기본 이미지로 교체
              }}
            />
            <h3>{item[primaryKey]}</h3> {/* 주요 키 값 */}
            <p>{item[secondaryKey]}</p> {/* 부가 설명 */}
          </div>
        ))}
      </div>
      <button
        onClick={() => HandleAuth(user, navigate, `/${pathPrefix}/new`)}
        className="floating-add-button"
      >
        ➕ 소개 추가
      </button>
    </div>
  );
}
