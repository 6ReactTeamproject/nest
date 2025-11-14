import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar";
import PostList from "./PostList";
import Pagination from "./Pagination";
import { apiGet } from "../../api/fetch";
import { filterPosts } from "../../utils/search";
import { getPaginatedItems, getTotalPages } from "../../utils/pagination";
import { useUser } from "../../hooks/UserContext";
import { useToast } from "../common/Toast";
import HandleAuth from "../common/HandleAuth";
import { POSTS_PER_PAGE, MESSAGES } from "../../constants";
import "../../styles/board.css";

const Board = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title_content");
  const [filtered, setFiltered] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUser();
  const { error: showError } = useToast();

  const currentPage = parseInt(searchParams.get("page")) || 1;
  const sortType = searchParams.get("sort") || "";
  const nav = useNavigate();

  // 페이지 이동
  const setCurrentPage = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  };

  // 정렬
  const setSortType = (type) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("sort", type);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // 데이터 불러오기 (async/await로 변경, reverse 제거)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [postsRes, membersRes, usersRes] = await Promise.all([
          apiGet("posts/info"),
          apiGet("members/info"),
          apiGet("user/info"),
        ]);

        // reverse() 제거 - 백엔드에서 이미 DESC로 정렬됨
        const postsData = postsRes.data ?? postsRes;
        setPosts(Array.isArray(postsData) ? postsData : []);
        setMembers(membersRes.data ?? membersRes);
        setUsers(usersRes.data ?? usersRes);
      } catch (err) {
        showError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 검색어 변경
  const handleTermChange = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setIsSearching(false);
      setFiltered([]);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setFiltered([]);
      return;
    }

    const results = filterPosts(
      posts,
      searchTerm.trim().toLowerCase(),
      searchType,
      users
    );
    setFiltered(results);
    setIsSearching(true);
    setCurrentPage(1);
  };

  // 정렬된 데이터
  const source = isSearching ? filtered : posts;
  const sortedPosts = [...source].sort((a, b) => {
    if (sortType === "views") return b.views - a.views;
    return 0;
  });

  const displayPosts = isSearching ? filtered : posts;
  const currentPosts = getPaginatedItems(sortedPosts, currentPage, POSTS_PER_PAGE);
  const totalPages = getTotalPages(displayPosts, POSTS_PER_PAGE);

  if (isLoading) {
    return <div className="board-container">{MESSAGES.LOADING}</div>;
  }

  return (
    <div className="board-container">
      <h2 className="board-title">게시판</h2>

      {/* 상단 버튼 */}
      <div className="board-actions">
        <div className="board-sort-buttons">
          <button
            className={`sort-button ${sortType === "" ? "active" : ""}`}
            onClick={() => setSortType("")}
          >
            최신순
          </button>
          <button
            className={`sort-button ${sortType === "views" ? "active" : ""}`}
            onClick={() => setSortType("views")}
          >
            조회수순
          </button>
        </div>

        <button
          className="board-write-button"
          onClick={() => {
            if (user) {
              nav("/post/write", {
                state: { fromBoard: true, page: currentPage, sort: sortType },
              });
            } else {
              HandleAuth(user, nav, "/post/write");
            }
          }}
        >
          게시글 작성
        </button>
      </div>

      {/* 게시글 목록 */}
      <PostList
        users={users}
        posts={currentPosts}
        currentPage={currentPage}
        sortType={sortType}
        onClickPost={(id, page, sort) => {
          nav(`/post/${id}`, { state: { fromBoard: true, page, sort } });
        }}
      />

      {/* 페이지네이션 */}
      {displayPosts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          onNext={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        />
      )}

      {/* 검색 */}
      <SearchBar
        searchTerm={searchTerm}
        searchType={searchType}
        onTermChange={handleTermChange}
        onTypeChange={setSearchType}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default Board;
