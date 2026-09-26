const AdminPagination = ({ page, pageSize, totalElements, totalPages, onPageChange, noun }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3">
    <span className="text-muted fs-13">
      Showing <strong>{totalElements === 0 ? 0 : page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)}</strong>
      {" "}of <strong>{totalElements}</strong> {noun}
    </span>
    {totalPages > 1 && (
      <div className="btn-group btn-group-sm" aria-label={`${noun} pages`}>
        <button type="button" className="btn btn-light border" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span className="btn btn-light border" aria-live="polite">Page {page + 1} of {totalPages}</span>
        <button type="button" className="btn btn-light border" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    )}
  </div>
);

export default AdminPagination;
