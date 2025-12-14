import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../../api/fetch";
import DeleteButton from "../../components/Travel&Member/DeleteButton";
import EditTravelIntro from "./EditTravelIntro";
import { useUser } from "../../hooks/UserContext";
import { compareIds } from "../../utils/helpers";
import { API_BASE_URL } from "../../constants";
import "../../styles/post.css";
import "../../styles/travel.css";

export default function DetailTravel() {
  // 장소 정보 저장
  const [travelPlace, setTravelPlace] = useState(null);
  // 수정 모드
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams(); // 현재 URL에서 장소 id 가져오기
  const navigate = useNavigate(); // 뒤로 가기 등 페이지 이동용
  const { user } = useUser(); // 현재 로그인한 사용자 정보

  // 컴포넌트가 마운트되거나 id가 바뀔 때 해당 장소 정보 불러오기
  useEffect(() => {
    apiGet("semester", id)
      .then((data) => setTravelPlace(data))
      .catch((err) => console.error("여행지 정보 불러오기 실패:", err));
  }, [id]);

  // 데이터가 아직 로딩 중일 경우 표시
  if (!travelPlace) return <p>로딩 중...</p>;

  // 로그인한 사용자가 글 작성자인지 확인 (authorId 또는 author.id 사용)
  const authorId = travelPlace.authorId || travelPlace.author?.id;
  const isOwner = user && compareIds(user.id, authorId);

  return (
    <div className="modal-content" style={{ position: "relative" }}>
      {/* 닫기 버튼 */}
      <button
        className="close-button"
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "12px",
          right: "20px",
          background: "none",
          border: "none",
          fontSize: "2rem",
          color: "#888",
          cursor: "pointer",
          zIndex: 10,
        }}
        aria-label="닫기"
      >
        ×
      </button>

      {/* 수정 모드와 보기 모드 분기 처리 */}
      {isEditing ? (
        <EditTravelIntro
          travelPlace={travelPlace}
          onDone={(updated) => {
            setTravelPlace(updated); // 수정된 데이터로 갱신
            setIsEditing(false); // 수정 모드 종료
          }}
        />
      ) : (
        <>
          {/* 이미지가 있을 경우 출력 */}
          {travelPlace.imageUrl && (
            <img
              src={travelPlace.imageUrl.startsWith('http') ? travelPlace.imageUrl : `${API_BASE_URL}${travelPlace.imageUrl}`}
              alt="preview"
              style={{ maxWidth: "340px", borderRadius: "8px" }}
            />
          )}
          {/* 제목 및 설명 출력 */}
          <h3>{travelPlace.title}</h3>
          <p>{travelPlace.description}</p>

          {/* 작성자 본인일 경우만 수정/삭제 버튼 표시 */}
          {isOwner && (
            <div className="button-group">
              <button onClick={() => setIsEditing(true)} className="add-button">
                ✏️ 수정
              </button>
              <DeleteButton
                endpoint="semester"
                Id={travelPlace.id}
                backaddress="/intro"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
