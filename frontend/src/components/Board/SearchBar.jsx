import { useState } from "react";
import "../../styles/board.css";

const SearchBar = ({
  searchTerm,
  searchType,
  onTermChange,
  onTypeChange,
  onSearch,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onTermChange(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="search-input"
          />
        </div>
        <div className="search-controls">
          <select
            value={searchType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="search-select"
          >
            <option value="title_content">제목+내용</option>
            <option value="title">제목만</option>
            <option value="content">내용만</option>
            <option value="author">작성자</option>
          </select>
          <button type="submit" className="search-button">
            검색
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
