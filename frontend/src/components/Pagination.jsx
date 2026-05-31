export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-textMuted hover:text-white hover:bg-surfaceHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
              p === currentPage 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-textMuted hover:text-white hover:bg-surface border border-transparent hover:border-border'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-textMuted hover:text-white hover:bg-surfaceHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
