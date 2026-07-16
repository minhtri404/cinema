import { useMemo, useState } from "react";

function usePagination(items, pageSize = 10) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    setRequestedPage(nextPage);
  };

  return {
    currentPage,
    goToPage,
    pageSize,
    paginatedItems,
    totalItems,
    totalPages,
  };
}

export default usePagination;
