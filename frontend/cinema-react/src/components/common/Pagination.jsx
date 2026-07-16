const pageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push(`gap-${page}`);
    result.push(page);
  });
  return result;
};

function Pagination({ currentPage, goToPage, pageSize, totalItems, totalPages }) {
  if (totalItems <= pageSize) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="app-pagination" aria-label="Phân trang">
      <p>Hiển thị <strong>{firstItem}–{lastItem}</strong> trong tổng số <strong>{totalItems}</strong></p>
      <div>
        <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước">‹</button>
        {pageNumbers(currentPage, totalPages).map((page) => typeof page === "string" ? (
          <span key={page} aria-hidden="true">…</span>
        ) : (
          <button key={page} type="button" className={page === currentPage ? "active" : ""} onClick={() => goToPage(page)} aria-current={page === currentPage ? "page" : undefined}>{page}</button>
        ))}
        <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau">›</button>
      </div>
    </nav>
  );
}

export default Pagination;
