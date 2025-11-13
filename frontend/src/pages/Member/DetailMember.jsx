import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditMember from "./EditMember";
import DeleteButton from "../../components/Travel&Member/DeleteButton";
import { useUser } from "../../hooks/UserContext";
import "../../styles/travel.css";
import "../../styles/post.css";

const API_URL = "http://localhost:3001/members";

function DetailMember() {
  const [members, setMembers] = useState(null); // 멤버 상세 정보를 저장
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const { id } = useParams(); // URL에서 멤버 ID 가져오기
  const navigate = useNavigate();
  const { user } = useUser(); // 현재 로그인한 사용자 정보

  useEffect(() => {
    // 해당 멤버 정보를 서버에서 받아와 state에 저장
    fetch(`${API_URL}/${id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
      });
  }, [id]);

  if (!members) return <p>로딩 중...</p>; // 데이터가 로딩 중일 때 표시

  const isOwner = String(user?.id) === String(members.authorId); // 작성자 여부 확인

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
                src={members.imageUrl}
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
