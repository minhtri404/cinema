import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../../../../api/eventApi";
import { getNews } from "../../../../api/newsApi";
import Pagination from "../../../../components/common/Pagination";
import usePagination from "../../../../hooks/usePagination";
import { resolveMediaUrl, toDateInputValue } from "../clientHomeUtils";

const stripHtml = (value) =>
  String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const eventStatus = (event) => {
  const today = toDateInputValue(new Date());
  if (event.startDate && event.startDate > today) return "Sắp diễn ra";
  if (event.endDate && event.endDate < today) return "Đã kết thúc";
  return "Đang diễn ra";
};

const normalizeEvent = (event) => ({
  id: `event-${event.id}`,
  rawId: event.id,
  type: "event",
  label: "Sự kiện",
  title: event.title || "Sự kiện điện ảnh",
  imageUrl: resolveMediaUrl(event.imageUrl),
  summary: event.content || "Thông tin sự kiện đang được cập nhật.",
  content: event.content || "",
  condition: event.applyCondition || "",
  dateLabel:
    event.startDate || event.endDate
      ? `${formatDate(event.startDate)}${event.endDate ? ` - ${formatDate(event.endDate)}` : ""}`
      : "Đang cập nhật",
  badge: eventStatus(event),
  sortDate: event.startDate || event.createdAt || "",
});

const normalizeArticle = (article) => ({
  id: `news-${article.id}`,
  rawId: article.id,
  type: "news",
  label: "Tin tức",
  title: article.title || "Tin tức điện ảnh",
  imageUrl: resolveMediaUrl(article.imageUrl),
  summary: stripHtml(article.content) || "Nội dung tin tức đang được cập nhật.",
  contentHtml: article.content || "",
  dateLabel: formatDate(article.updatedAt || article.createdAt) || "Đang cập nhật",
  badge: "Tin mới",
  sortDate: article.updatedAt || article.createdAt || "",
});

function ClientNewsEventsSection() {
  const [items, setItems] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.allSettled([getEvents(), getNews()])
      .then(([eventResult, newsResult]) => {
        if (!active) return;

        const eventItems =
          eventResult.status === "fulfilled"
            ? (eventResult.value.data || [])
                .filter((event) => String(event.status || "").toUpperCase() === "ONLINE")
                .map(normalizeEvent)
            : [];

        const newsItems =
          newsResult.status === "fulfilled"
            ? (newsResult.value.data || [])
                .filter((article) => String(article.status || "").toUpperCase() === "ONLINE")
                .map(normalizeArticle)
            : [];

        if (eventResult.status === "rejected" && newsResult.status === "rejected") {
          setError("Không tải được tin tức và sự kiện từ hệ thống.");
        } else {
          setError("");
        }

        setItems(
          [...eventItems, ...newsItems].sort((left, right) =>
            String(right.sortDate).localeCompare(String(left.sortDate)),
          ),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(
    () => (activeType === "all" ? items : items.filter((item) => item.type === activeType)),
    [activeType, items],
  );

  const pagination = usePagination(filteredItems, 7);
  const featuredItem = pagination.paginatedItems[0] || null;
  const listItems = featuredItem ? pagination.paginatedItems.slice(1) : pagination.paginatedItems;
  const eventCount = items.filter((item) => item.type === "event").length;
  const newsCount = items.filter((item) => item.type === "news").length;

  return (
    <section className="client-news-events" id="news">
      <div className="news-events-header">
        <div>
          <span className="section-kicker">Tin mới từ HMCinema</span>
          <h2>Tin tức / Sự kiện</h2>
          <p>Cập nhật khuyến mãi, sự kiện điện ảnh và thông tin rạp mới nhất từ hệ thống.</p>
        </div>
        <div className="news-events-stats" aria-label="Thống kê tin tức sự kiện">
          <strong>{items.length}</strong>
          <span>bài viết</span>
        </div>
      </div>

      <div className="news-events-tabs" aria-label="Lọc tin tức sự kiện">
        <button type="button" className={activeType === "all" ? "active" : ""} onClick={() => setActiveType("all")}>
          Tất cả <span>{items.length}</span>
        </button>
        <button type="button" className={activeType === "event" ? "active" : ""} onClick={() => setActiveType("event")}>
          Sự kiện <span>{eventCount}</span>
        </button>
        <button type="button" className={activeType === "news" ? "active" : ""} onClick={() => setActiveType("news")}>
          Tin tức <span>{newsCount}</span>
        </button>
      </div>

      {loading ? (
        <div className="news-events-state">Đang tải tin tức và sự kiện...</div>
      ) : error ? (
        <div className="news-events-state error">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="news-events-state">Chưa có tin tức hoặc sự kiện phù hợp.</div>
      ) : (
        <>
          {featuredItem && (
            <article className="news-event-featured">
              <div className="news-event-image">
                {featuredItem.imageUrl ? (
                  <img src={featuredItem.imageUrl} alt={featuredItem.title} />
                ) : (
                  <span>HMCinema</span>
                )}
              </div>
              <div className="news-event-featured-content">
                <div className="news-event-meta">
                  <span>{featuredItem.label}</span>
                  <strong>{featuredItem.badge}</strong>
                  <time>{featuredItem.dateLabel}</time>
                </div>
                <h3>{featuredItem.title}</h3>
                <p>{featuredItem.summary}</p>
                {featuredItem.condition && <small>Điều kiện: {featuredItem.condition}</small>}
                <button type="button" onClick={() => setSelectedItem(featuredItem)}>
                  Xem chi tiết
                </button>
              </div>
            </article>
          )}

          {listItems.length > 0 && (
            <div className="news-event-grid">
              {listItems.map((item) => (
                <article className="news-event-card" key={item.id}>
                  <div className="news-event-card-image">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span>HMCinema</span>}
                  </div>
                  <div className="news-event-card-body">
                    <div className="news-event-meta">
                      <span>{item.label}</span>
                      <time>{item.dateLabel}</time>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <button type="button" onClick={() => setSelectedItem(item)}>
                      Xem thêm
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Pagination {...pagination} />
        </>
      )}

      {selectedItem && (
        <div className="news-event-modal-overlay" onMouseDown={() => setSelectedItem(null)}>
          <article className="news-event-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="news-event-modal-close" onClick={() => setSelectedItem(null)}>
              ×
            </button>
            <div className="news-event-modal-image">
              {selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt={selectedItem.title} /> : <span>HMCinema</span>}
            </div>
            <div className="news-event-modal-body">
              <div className="news-event-meta">
                <span>{selectedItem.label}</span>
                <strong>{selectedItem.badge}</strong>
                <time>{selectedItem.dateLabel}</time>
              </div>
              <h2>{selectedItem.title}</h2>
              {selectedItem.type === "news" && selectedItem.contentHtml ? (
                <div className="news-event-rich-content" dangerouslySetInnerHTML={{ __html: selectedItem.contentHtml }} />
              ) : (
                <p>{selectedItem.content || selectedItem.summary}</p>
              )}
              {selectedItem.condition && (
                <div className="news-event-condition">
                  <strong>Điều kiện áp dụng</strong>
                  <p>{selectedItem.condition}</p>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default ClientNewsEventsSection;
