const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

const AdminPagination = ({ page, pageSize, totalElements, totalPages, onPageChange, noun = "items" }) => {
  const currentPage = page + 1;

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top mt-3">
      <span className="text-muted fs-13">
        Showing <strong>{totalElements === 0 ? 0 : page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)}</strong>
        {" "}of <strong>{totalElements}</strong> {noun}
      </span>
      {totalPages > 1 && (
        <div className="btn-group btn-group-sm" role="group" aria-label={`${noun} pages`}>
          <button
            type="button"
            className="btn btn-light border"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            title="Previous page"
          >
            &lt;
          </button>
          {getPageNumbers(currentPage, totalPages).map((item, idx) =>
            item === "..." ? (
              <span key={`ellipsis-${idx}`} className="btn btn-light border disabled px-2">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`btn ${
                  item === currentPage
                    ? "btn-dark bg-color-primary border-0 fw-bold text-white"
                    : "btn-light border"
                }`}
                style={item === currentPage ? { backgroundColor: "#e9613f" } : {}}
                onClick={() => onPageChange(item - 1)}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            className="btn btn-light border"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            title="Next page"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPagination;
