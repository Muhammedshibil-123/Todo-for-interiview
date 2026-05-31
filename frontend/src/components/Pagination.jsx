export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Build array of page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        id="page-prev"
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >← Prev</button>

      {pages.map(p => (
        <button
          key={p}
          id={`page-${p}`}
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >{p}</button>
      ))}

      <button
        id="page-next"
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >Next →</button>
    </div>
  );
}
