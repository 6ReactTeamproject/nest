import { apiDelete } from "../../api/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/post.css";

// 게시글 액션 버튼 컴포넌트
function PostActions({ post, currentUser, id, navigate }) {
  const location = useLocation();
  const navigateTo = useNavigate();

  // 게시글 삭제 처리
  const handleDelete = () => {
    // 삭제 확인창 띄우기
    if (window.confirm("정말 삭제하시겠습니까?")) {
      // 서버에 DELETE 요청
      apiDelete("posts", id)
        .then(() => {
          // 게시판에서 왔다면 해당 페이지로 돌아가기
          if (location.state?.fromBoard) {
            let url = "/post";
            const params = [];
            if (location.state.page) params.push(`page=${location.state.page}`);
            if (location.state.sort) params.push(`sort=${location.state.sort}`);
            if (params.length > 0) url += "?" + params.join("&");
            navigateTo(url);
          } else {
            // 이전 페이지로 이동
            navigate(-1);
          }
        })
        .catch((error) => {
          console.error("게시글 삭제 실패:", error);
          alert("게시글 삭제에 실패했습니다.");
        });
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigateTo(`/post/edit/${id}`, {
      state: {
        fromBoard: location.state?.fromBoard,
        page: location.state?.page,
        sort: location.state?.sort,
      },
    });
  };

  // 작성자만 수정/삭제 버튼 표시
  const isAuthor =
    currentUser && post && String(currentUser.id) === String(post.userId);

  return (
    <div className="post-actions-container">
      {/* 작성자 정보 표시 */}

      {/* 작성자인 경우에만 수정/삭제 버튼 표시 */}
      {isAuthor && (
        <>
          <button className="edit-button" onClick={handleEdit}>
            수정
          </button>
          <button className="delete-button" onClick={handleDelete}>
            삭제
          </button>
        </>
      )}
    </div>
  );
}

export default PostActions;
