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
  const [travelPlace, setTravelPlace] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    apiGet("semester", id)
      .then((data) => setTravelPlace(data))
      .catch((err) => console.error("여행지 정보 불러오기 실패:", err));
  }, [id]);

  if (!travelPlace) return <p>로딩 중...</p>;

  const authorId = travelPlace.authorId || travelPlace.author?.id;
  const isOwner = user && compareIds(user.id, authorId);

  return (
    <div className="modal-content" style={{ position: "relative" }}>
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

      {isEditing ? (
        <EditTravelIntro
          travelPlace={travelPlace}
          onDone={(updated) => {
            setTravelPlace(updated);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          {travelPlace.imageUrl && (
            <img
              src={travelPlace.imageUrl.startsWith('http') ? travelPlace.imageUrl : `${API_BASE_URL}${travelPlace.imageUrl}`}
              alt="preview"
              style={{ maxWidth: "340px", borderRadius: "8px" }}
            />
          )}
          <h3>{travelPlace.title}</h3>
          <p>{travelPlace.description}</p>

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
