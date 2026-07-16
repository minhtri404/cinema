export const fallbackBanners = [
  {
    id: "fallback-inception",
    title: "Inception",
    imageUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85",
  },
];

export const fallbackMovies = [
  {
    id: "oppenheimer",
    title: "OPPENHEIMER",
    duration: 70,
    genre: "Hành Động | Lịch Sử | Tâm Lý",
    director: "Christopher Nolan",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "blue-whale",
    title: "BLUE WHALE: THỬ THÁCH CÁ VOI XANH",
    duration: 100,
    genre: "Hành Động | Kinh Dị",
    director: "Anna Zaytseva",
    ageRating: "C18",
    posterUrl:
      "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "detective",
    title: "THANH TRA SÁT NHÂN",
    duration: 180,
    genre: "Hành Động",
    director: "Đang cập nhật",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
  {
    id: "fanti",
    title: "FANTI",
    duration: 140,
    genre: "Tâm Lý",
    director: "Đang cập nhật",
    ageRating: "C16",
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=520&q=80",
    status: "NOW_SHOWING",
  },
];

export const initialLoginForm = {
  email: "",
  password: "",
  remember: true,
};

export const initialRegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export const initialMovieFilters = {
  actor: "",
  director: "",
  genres: [],
  ageRating: "",
};

export const BOOKING_HOLD_SECONDS = 600;
