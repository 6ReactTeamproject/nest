import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/fetch";
import "../../styles/topposts.css"

const TopPosts = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await apiGet("posts/info");
        const usersRes = await apiGet("user/info");
        
        const allPosts = postsRes.data ?? postsRes;
        const allUsers = usersRes.data ?? usersRes;

        const sorted = [...allPosts].sort((a, b) => b.views - a.views);
        setPosts(sorted.slice(0, 5));
        setUsers(allUsers);
      } catch (err) {
        console.error("조회수 TOP5 게시글 로딩 실패:", err);
      }
    };

    fetchData();
  }, []);

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
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <div className="post-title">{post.title}</div>
            <div className="post-preview">{post.content}</div>
            <div className="post-meta">
              {getAuthorName(post.userId)} · 📖 {post.views || 0}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopPosts;
