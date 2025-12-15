import "../../styles/board.css";

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => (
  <div className="pagination-container">
    <span onClick={onPrev} className="pagination-button">
      &lt;
    </span>

    <span className="pagination-info">
      {currentPage} / {totalPages}
    </span>

    <span onClick={onNext} className="pagination-button">
      &gt;
    </span>
  </div>
);

export default Pagination;
