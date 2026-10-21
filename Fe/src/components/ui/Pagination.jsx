import { useTranslation } from "react-i18next";

const pageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index);
  const visible = new Set([0, total - 1, current - 1, current, current + 1]);
  if (current < 3) [0, 1, 2, 3].forEach((number) => visible.add(number));
  if (current > total - 4) [total - 4, total - 3, total - 2, total - 1].forEach((number) => visible.add(number));
  return [...visible].filter((number) => number >= 0 && number < total).sort((a, b) => a - b);
};

const Pagination = ({ page, totalPages, onPageChange, ariaLabel, className = "" }) => {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  const visiblePages = pageNumbers(page, totalPages);

  return (
    <nav className={`app-pagination ${className}`.trim()} aria-label={ariaLabel}>
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label={t("common.previousPage")}>‹</button>
      {visiblePages.map((number, index) => (
        <span key={number} className="app-pagination-group">
          {index > 0 && number - visiblePages[index - 1] > 1 && <span className="app-pagination-ellipsis">…</span>}
          <button
            type="button"
            className={number === page ? "active" : ""}
            aria-current={number === page ? "page" : undefined}
            onClick={() => onPageChange(number)}
          >
            {number + 1}
          </button>
        </span>
      ))}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} aria-label={t("common.nextPage")}>›</button>
    </nav>
  );
};

export default Pagination;

