import { apiDelete } from "../../api/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { MESSAGES } from "../../constants";
import { compareIds } from "../../utils/helpers";
import "../../styles/post.css";

function PostActions({ post, currentUser, id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const handleDelete = async () => {
    if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
      try {
        await apiDelete("posts", id);
        success("게시글이 삭제되었습니다.");
        
        if (location.state?.fromBoard) {
          let url = "/post";
          const params = [];
          if (location.state.page) params.push(`page=${location.state.page}`);
          if (location.state.sort) params.push(`sort=${location.state.sort}`);
          if (params.length > 0) url += "?" + params.join("&");
          navigate(url);
        } else {
          navigate(-1);
        }
      } catch (err) {
        showError(err.message || "게시글 삭제에 실패했습니다.");
      }
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/post/edit/${id}`, {
      state: {
        fromBoard: location.state?.fromBoard,
        page: location.state?.page,
        sort: location.state?.sort,
      },
    });
  };

  // 작성자만 수정/삭제 버튼 표시
  const isAuthor = currentUser && post && compareIds(currentUser.id, post.userId);

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
