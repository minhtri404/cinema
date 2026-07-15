export const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value) => {
  if (!value) return new Date();
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

export const buildScheduleDates = (startDate = new Date(), total = 8) =>
  Array.from({ length: total }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const value = toDateInputValue(date);
    return {
      value,
      label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
    };
  });

export const formatShowtimeTime = (value) => String(value || "").slice(0, 5);

export const formatDuration = (duration) => {
  if (!duration) return "Đang cập nhật";
  return `${duration} phÃºt`;
};

export const getMovieStatus = (movie) => String(movie.status || "").trim().toUpperCase();

export const movieMatchesTab = (movie, tab) => {
  const status = getMovieStatus(movie);
  if (tab === "coming") return status === "COMING_SOON";
  if (tab === "advance") return status === "ADVANCE_BOOKING" || status === "PRE_SALE";
  return status === "NOW_SHOWING" || status === "ACTIVE" || !status;
};

export const getPoster = (movie) => {
  const value = movie.posterUrl || movie.imageUrl || movie.thumbnailUrl || movie.poster || "";
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  if (value.startsWith("uploads/") || value.startsWith("media/")) return `/${value}`;
  return value;
};

export const getTrailerUrl = (movie) => movie.trailerUrl || movie.trailer || movie.videoUrl || "";

export const getTrailerEmbedUrl = (movie) => {
  const value = String(getTrailerUrl(movie) || "").trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname.startsWith("/embed/")) return value;
      if (url.pathname.startsWith("/shorts/")) {
        const videoId = url.pathname.split("/").filter(Boolean)[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return value;
  } catch {
    return "";
  }
};

export const getAgeRating = (movie) =>
  movie.ageRating || movie.rating || movie.ageLimit || "Đang cập nhật";

export const ageRatingDescriptions = {
  P: "PHIM PHÙ HỢP VỚI MỌI ĐỘ TUỔI",
  K: "PHIM DÀNH CHO KHÁN GIẢ DƯỚI 13 TUỔI KHI CÓ NGƯỜI GIÁM HỘ",
  C13: "PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ 13 TUỔI TRỞ LÊN (13+)",
  C16: "PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ 16 TUỔI TRỞ LÊN (16+)",
  C18: "PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ 18 TUỔI TRỞ LÊN (18+)",
};

export const getAgeDescription = (rating) => {
  const normalizedRating = String(rating || "").trim().toUpperCase();
  if (ageRatingDescriptions[normalizedRating]) return ageRatingDescriptions[normalizedRating];

  const ageNumber = normalizedRating.replace(/\D/g, "");
  if (ageNumber) {
    return `PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ ${ageNumber} TUỔI TRỞ LÊN (${ageNumber}+)`;
  }

  return "ĐANG CẬP NHẬT PHÂN LOẠI ĐỘ TUỔI";
};

export const normalizeSearchValue = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const splitGenres = (genre) =>
  String(genre || "")
    .split(/[|,;/]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const hasActiveFilters = (filters) =>
  Boolean(
    filters.actor.trim() ||
      filters.director.trim() ||
      filters.ageRating ||
      filters.genres.length > 0,
  );

export const movieMatchesFilters = (movie, filters) => {
  const actorKeyword = normalizeSearchValue(filters.actor);
  const directorKeyword = normalizeSearchValue(filters.director);
  const movieActors = normalizeSearchValue(movie.cast || movie.actors || movie.actorNames);
  const movieDirector = normalizeSearchValue(movie.director);
  const movieRating = normalizeSearchValue(getAgeRating(movie));
  const movieGenres = splitGenres(movie.genre).map(normalizeSearchValue);

  if (actorKeyword && !movieActors.includes(actorKeyword)) return false;
  if (directorKeyword && !movieDirector.includes(directorKeyword)) return false;
  if (filters.ageRating && movieRating !== normalizeSearchValue(filters.ageRating)) return false;
  if (
    filters.genres.length > 0 &&
    !filters.genres.every((genre) => movieGenres.includes(normalizeSearchValue(genre)))
  ) {
    return false;
  }

  return true;
};

export const readClientAuth = () => {
  try {
    const raw = localStorage.getItem("clientAuth") || sessionStorage.getItem("clientAuth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("clientAuth");
    sessionStorage.removeItem("clientAuth");
    return null;
  }
};

export const saveClientAuth = (auth, remember = true) => {
  const payload = JSON.stringify(auth);
  localStorage.removeItem("clientAuth");
  sessionStorage.removeItem("clientAuth");

  if (remember) {
    localStorage.setItem("clientAuth", payload);
  } else {
    sessionStorage.setItem("clientAuth", payload);
  }
};

export const clearClientAuth = () => {
  localStorage.removeItem("clientAuth");
  sessionStorage.removeItem("clientAuth");
};

export const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.status && error?.response?.status) {
    return `Lỗi ${error.response.status}: ${fallback}`;
  }
  return error?.message || fallback;
};

export const formatHoldTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export const seatPrice = (seat) => {
  const type = String(seat.seatType || "").toUpperCase();
  if (type.includes("COUPLE")) return 115000 + Number(seat.extraPrice || 0);
  if (type.includes("VIP")) return 105000 + Number(seat.extraPrice || 0);
  return 85000 + Number(seat.extraPrice || 0);
};

export const groupSeatsByRow = (seats) => {
  const groups = new Map();
  seats
    .slice()
    .sort((a, b) => {
      const rowCompare = String(a.seatRow || a.seatCode || "").localeCompare(String(b.seatRow || b.seatCode || ""));
      if (rowCompare !== 0) return rowCompare;
      return Number(a.seatNumber || 0) - Number(b.seatNumber || 0);
    })
    .forEach((seat) => {
      const row = seat.seatRow || String(seat.seatCode || "?").replace(/[0-9]/g, "") || "?";
      if (!groups.has(row)) groups.set(row, []);
      groups.get(row).push(seat);
    });
  return Array.from(groups.entries()).map(([row, rowSeats]) => ({ row, seats: rowSeats }));
};

export const normalizeClientText = (value) =>
  String(value || "")
    .replace(/Ph??ng/gi, "Ph?ng")
    .replace(/Ph??ng/gi, "Ph?ng")
    .replace(/Ph(?:áº£|áº£|áº³|Ã²|ò|\? )ng/gi, "Phòng")
    .replace(/Ráº¡p/gi, "Rạp")
    .replace(/KhÃ¡ch h\?ng/gi, "Khách hàng");
