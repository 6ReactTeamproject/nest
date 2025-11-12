import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/fetch";
import "../../styles/topposts.css"

const TopPosts = () => {
  const [posts, setPosts] = useState([]); // 인기 게시글 목록을 저장
  const [users, setUsers] = useState([]); // 사용자 정보 목록을 저장
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 컴포넌트가 마운트될 때 게시글과 사용자 데이터를 불러옴
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 전체 게시글과 사용자 목록을 API로부터 받아옴
        const allPosts = await apiGet("posts/info");
        const allUsers = await apiGet("users/info");

        // 게시글을 조회수 기준으로 내림차순 정렬, 상위 5개만 저장
        const sorted = [...allPosts].sort((a, b) => b.views - a.views);
        setPosts(sorted.slice(0, 5));
        setUsers(allUsers);
      } catch (err) {
        console.error("조회수 TOP5 게시글 로딩 실패:", err);
      }
    };

    fetchData();
  }, []);

  // 게시글 작성자의 이름을 userId로 찾아 반환
  const getAuthorName = (userId) =>
    users.find((u) => u.id === userId)?.name || "익명";

  return (
    <div className="top-posts-container">
      <h2 className="top-posts-title">인기 게시글 TOP 5</h2>
      <ul className="top-posts-list">
        {posts.map((post) => (
          <li
            key={post.id}
            className="top-post-item"
            onClick={() => navigate(`/post/${post.id}`)} // 클릭 시 해당 게시글 상세 페이지로 이동
          >
            <div className="post-title">{post.title}</div> {/* 게시글 제목 */}
            <div className="post-preview">{post.content}</div> {/* 게시글 내용 미리보기 */}
            <div className="post-meta">
              {getAuthorName(post.userId)} · 📖 {post.views || 0} {/* 작성자와 조회수 표시 */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopPosts;
