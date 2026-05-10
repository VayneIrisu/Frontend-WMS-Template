'use client';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, total, totalPages } = pagination;

  const pages = [];
  const maxShow = 5;
  let start = Math.max(1, page - Math.floor(maxShow / 2));
  let end = Math.min(totalPages, start + maxShow - 1);
  if (end - start + 1 < maxShow) {
    start = Math.max(1, end - maxShow + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <div className="text-muted">
        Menampilkan {(page - 1) * (pagination.limit || 10) + 1} - {Math.min(page * (pagination.limit || 10), total)} dari {total} data
      </div>
      <div className="pagination-buttons">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
