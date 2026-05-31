// Pagination component — shows page numbers and prev/next buttons
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate page numbers to display
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        id="page-prev"
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          id={`page-${page}`}
          className={`page-btn ${currentPage === page ? 'page-active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        id="page-next"
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}
