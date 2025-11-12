import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "./SearchBar";
import PostList from "./PostList";
import Pagination from "./Pagination";
import { apiGet, apiPost } from "../../api/fetch";
import { filterPosts } from "../../utils/search";
import { getPaginatedItems, getTotalPages } from "../../utils/pagination";
import { useUser } from "../../hooks/UserContext";
import HandleAuth from "../common/HandleAuth";
import "../../styles/board.css";

const Board = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // 게시글 및 검색 관련 상태
  const [posts, setPosts] = useState([]); // 전체 게시글
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [searchType, setSearchType] = useState("title_content"); // 검색 타입
  const [filtered, setFiltered] = useState([]); // 검색 결과 게시글
  const [isSearching, setIsSearching] = useState(false); // 검색 실행 여부

  // 사용자/멤버 정보
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  const { user } = useUser(); // 로그인한 유저 정보
  const postsPerPage = 5; // 페이지당 게시글 수

  // 현재 페이지/정렬 방식
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const sortType = searchParams.get("sort") || "";

  const nav = useNavigate();

  // 현재 페이지 설정
  const setCurrentPage = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  };

  // 정렬 변경 함수
  const setSortType = (type) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("sort", type);
    newSearchParams.set("page", "1"); // 정렬 변경 시 1페이지로 이동
    setSearchParams(newSearchParams);
  };

  // 게시글, 멤버, 유저 정보 초기 로드
  useEffect(() => {
    apiGet("posts/info")
      .then((data) => setPosts([...data].reverse())) // 최신순 정렬
      .catch((err) => console.error("에러:", err));

    apiGet("members/info")
      .then((data) => setMembers(data))
      .catch((err) => console.error("에러:", err));

    apiGet("users/info")
      .then((data) => setUsers(data))
      .catch((err) => console.error("에러:", err));
  }, []);

  // 검색어 변경 처리
  const handleTermChange = (term) => {
    setSearchTerm(term);
    // 검색어가 비어있으면 검색 상태 해제
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
    setFiltered(results); // 검색 결과 저장
    setIsSearching(true); // 검색 상태 활성화
    setCurrentPage(1); // 검색 후 1페이지로 이동
  };

  // 정렬 기준에 따라 게시글 목록 구성
  const source = isSearching ? filtered : posts; // 검색 중이면 필터링된 결과, 아니면 전체 게시글
  const sortedPosts = [...source].sort((a, b) => {
    if (sortType === "views") return b.views - a.views; // 조회수순 정렬
    return 0;
  });

  // 현재 페이지에 표시할 게시글 목록
  const displayPosts = isSearching ? filtered : posts; // 검색 중이면 필터링된 결과, 아니면 전체 게시글
  const currentPosts = getPaginatedItems(
    sortedPosts,
    currentPage,
    postsPerPage
  );
  const totalPages = getTotalPages(displayPosts, postsPerPage);

  return (
    <div className="board-container">
      <h2 className="board-title">게시판</h2>

      {/* 상단 액션 영역 */}
      <div className="board-actions">
        <div className="board-sort-buttons">
          {/* 정렬 버튼 */}
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
        {/* 게시글 작성 버튼 */}
        <button
          className="board-write-button"
          onClick={() => {
            if (user) {
              nav("/post/write", {
                state: {
                  fromBoard: true,
                  page: currentPage,
                  sort: sortType,
                },
              });
            } else {
              HandleAuth(user, nav, "/post/write"); // 비로그인 시 로그인 창으로 이동
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
          nav(`/post/${id}`, {
            state: {
              fromBoard: true,
              page: page,
              sort: sort,
            },
          });
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

      {/* 검색 영역 */}
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
