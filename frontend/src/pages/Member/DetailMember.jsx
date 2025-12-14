import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../../api/fetch";
import EditMember from "./EditMember";
import DeleteButton from "../../components/Travel&Member/DeleteButton";
import { useUser } from "../../hooks/UserContext";
import { compareIds } from "../../utils/helpers";
import { API_BASE_URL } from "../../constants";
import "../../styles/travel.css";
import "../../styles/post.css";

function DetailMember() {
  const [members, setMembers] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    apiGet("members", id)
      .then((data) => {
        setMembers(data);
      })
      .catch((err) => console.error("멤버 정보 불러오기 실패:", err));
  }, [id]);

  if (!members) return <p>로딩 중...</p>;

  const memberUserId = members.user_id || members.user?.id;
  const isOwner = user && compareIds(user.id, memberUserId);

  return (
    <>
      <div
        className="modal-content"
        style={{ position: "relative" }}
      >
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

        {/* 수정 모드일 경우 수정 폼을 표시 */}
        {isEditing ? (
          <EditMember
            member={members}
            onDone={(updated) => {
              setMembers(updated); // 수정된 내용 반영
              setIsEditing(false); // 수정 모드 종료
            }}
          />
        ) : (
          <>
            {/* 이미지가 있을 경우 출력 */}
            {members.imageUrl && (
              <img  
                src={members.imageUrl.startsWith('http') ? members.imageUrl : `${API_BASE_URL}${members.imageUrl}`}
                alt="preview"
                style={{ maxWidth: "340px", borderRadius: "8px" }}
              />
            )}
            <br />
            <strong>{members.name}</strong>
            <p>{members.introduction}</p>

            {/* 작성자인 경우에만 수정/삭제 버튼 표시 */}
            {isOwner && (
              <div className="button-group">
                <button
                  onClick={() => setIsEditing(true)}
                  className="add-button"
                >
                  ✏️ 수정
                </button>
                <DeleteButton
                  endpoint="members"
                  Id={members.id}
                  backaddress="/team"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DetailMember;
