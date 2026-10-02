const AdminListControls = ({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  sort,
  onSortChange,
  sortOptions = [],
}) => (
  <div className="admin-card mb-4">
    <div className="d-flex flex-wrap align-items-center gap-3">
      <div className="admin-search-box">
        <i className="fa-solid fa-magnifying-glass text-muted fs-13" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>
      {filters.map((filter) => (
        <select
          key={filter.label}
          className="admin-select-sm"
          aria-label={filter.label}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ))}
      <select
        className="admin-select-sm"
        aria-label="Sort orders"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
);

export default AdminListControls;
