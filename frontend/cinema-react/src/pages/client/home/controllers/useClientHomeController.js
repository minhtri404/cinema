import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdvertisements } from "../../../../api/advertisementApi";
import { loginUser, logoutUser, registerUser, resendVerificationEmail } from "../../../../api/authApi";
import { createBooking, getBookedSeats, getSeatLocks, holdBookingSeats } from "../../../../api/bookingApi";
import { getFoods } from "../../../../api/foodApi";
import { getMovies } from "../../../../api/movieApi";
import { createVnpayPayment } from "../../../../api/paymentApi";
import { applyPromotion } from "../../../../api/promotionApi";
import { getSeatsByRoom } from "../../../../api/seatApi";
import { getShowtimes } from "../../../../api/showtimeApi";
import { getTheaters } from "../../../../api/theaterApi";
import {
  BOOKING_HOLD_SECONDS,
  fallbackBanners,
  fallbackMovies,
  initialLoginForm,
  initialMovieFilters,
  initialRegisterForm,
} from "../models/clientHomeModel";
import {
  buildScheduleDates,
  clearClientAuth,
  errorMessage,
  groupSeatsByRow,
  hasActiveFilters,
  movieMatchesFilters,
  movieMatchesTab,
  normalizeClientText,
  normalizeSearchValue,
  parseLocalDate,
  readClientAuth,
  resolveMediaUrl,
  saveClientAuth,
  seatPrice,
  splitGenres,
  toDateInputValue,
} from "../clientHomeUtils";

const initialFiltersFromUrl = () => {
  if (typeof window === "undefined") return initialMovieFilters;
  const params = new URLSearchParams(window.location.search);
  const genre = params.get("genre") || "";
  const releaseYear = params.get("year") || "";
  return {
    ...initialMovieFilters,
    genres: genre ? [normalizeClientText(genre)] : [],
    releaseYear,
  };
};

function useClientHomeController() {
  const [movies, setMovies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "now";
    const params = new URLSearchParams(window.location.search);
    return params.has("genre") || params.has("year") ? "all" : "now";
  });
  const [scheduleMode, setScheduleMode] = useState("movie");
  const [selectedScheduleMovieId, setSelectedScheduleMovieId] = useState(null);
  const [selectedScheduleTheaterId, setSelectedScheduleTheaterId] = useState(null);
  const [requestedScheduleDate, setSelectedScheduleDate] = useState(() => toDateInputValue(new Date()));
  const [bannerIndex, setBannerIndex] = useState(0);
  const [auth, setAuth] = useState(readClientAuth);
  const [view, setView] = useState("home");
  const [accountTab, setAccountTab] = useState("profile");
  const [authMode, setAuthMode] = useState(null);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailScheduleDate, setDetailScheduleDate] = useState(() => toDateInputValue(new Date()));
  const [draftFilters, setDraftFilters] = useState(initialFiltersFromUrl);
  const [appliedFilters, setAppliedFilters] = useState(initialFiltersFromUrl);
  const [bookingShowtime, setBookingShowtime] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);
  const [bookingSeats, setBookingSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState(new Set());
  const [ownHeldSeatIds, setOwnHeldSeatIds] = useState(new Set());
  const [selectedBookingSeats, setSelectedBookingSeats] = useState([]);
  const [bookingCombos, setBookingCombos] = useState([]);
  const [bookingComboQuantities, setBookingComboQuantities] = useState({});
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingHoldExpiresAt, setBookingHoldExpiresAt] = useState(null);
  const [bookingHoldSeconds, setBookingHoldSeconds] = useState(BOOKING_HOLD_SECONDS);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionMessage, setPromotionMessage] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("VNPAY");
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickMovieId, setQuickMovieId] = useState("");
  const [quickDate, setQuickDate] = useState("");
  const [quickShowtimeId, setQuickShowtimeId] = useState("");

  useEffect(() => {
    const handleAuthRefreshed = (event) => {
      if (event.detail) setAuth(event.detail);
    };
    const handleAuthExpired = () => {
      clearClientAuth();
      setAuth(null);
      setSelectedBookingSeats([]);
      setOwnHeldSeatIds(new Set());
      setBookingHoldExpiresAt(null);
      setBookingError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục đặt vé.");
      setAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setAuthMode("login");
    };

    window.addEventListener("cinema:auth-refreshed", handleAuthRefreshed);
    window.addEventListener("cinema:auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("cinema:auth-refreshed", handleAuthRefreshed);
      window.removeEventListener("cinema:auth-expired", handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.allSettled([getMovies(), getAdvertisements(), getShowtimes(), getTheaters()]).then(([movieResult, adResult, showtimeResult, theaterResult]) => {
      if (!active) return;

      if (movieResult.status === "fulfilled") {
        setMovies(movieResult.value.data || []);
      }

      if (adResult.status === "fulfilled") {
        const todayValue = toDateInputValue(new Date());
        const onlineHomeBanners = (adResult.value.data || [])
          .filter((ad) => {
            const status = String(ad.status || "").toUpperCase();
            const placement = String(ad.placement || "").toUpperCase();
            const started = !ad.startDate || String(ad.startDate) <= todayValue;
            const notExpired = !ad.endDate || String(ad.endDate) >= todayValue;
            return status === "ONLINE" && placement === "HOME_BANNER" && started && notExpired && ad.imageUrl;
          })
          .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0))
          .map((ad) => ({ ...ad, imageUrl: resolveMediaUrl(ad.imageUrl) }));
        setBanners(onlineHomeBanners);
      }

      if (showtimeResult.status === "fulfilled") {
        setShowtimes(showtimeResult.value.data || []);
      }

      if (theaterResult.status === "fulfilled") {
        setTheaters(theaterResult.value.data || []);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const displayBanners = banners.length > 0 ? banners : fallbackBanners;
  const currentBanner = displayBanners[bannerIndex % displayBanners.length];
  const displayMovies = movies.length > 0 ? movies : fallbackMovies;
  const theaterMap = useMemo(() => {
    const map = new Map();
    theaters.forEach((theater) => {
      map.set(Number(theater.id), theater);
    });
    return map;
  }, [theaters]);
  const activeShowtimes = useMemo(
    () =>
      showtimes.filter((showtime) => {
        const status = String(showtime.status || "").toUpperCase();
        return status !== "OFFLINE" && status !== "CANCELLED";
      }),
    [showtimes],
  );
  const scheduleMovieIds = useMemo(
    () => new Set(activeShowtimes.map((showtime) => Number(showtime.movieId)).filter(Boolean)),
    [activeShowtimes],
  );
  const scheduleMovies = useMemo(
    () => displayMovies.filter((movie) => scheduleMovieIds.has(Number(movie.id))),
    [displayMovies, scheduleMovieIds],
  );
  const scheduleTheaterIds = useMemo(
    () => new Set(activeShowtimes.map((showtime) => Number(showtime.theaterId)).filter(Boolean)),
    [activeShowtimes],
  );
  const scheduleTheaters = useMemo(
    () => theaters.filter((theater) => scheduleTheaterIds.has(Number(theater.id))),
    [scheduleTheaterIds, theaters],
  );
  const selectedQuickMovie =
    scheduleMovies.find((movie) => Number(movie.id) === Number(quickMovieId)) ||
    scheduleMovies[0] ||
    null;
  const quickDates = useMemo(() => {
    if (!selectedQuickMovie) return [];
    return Array.from(
      new Set(
        activeShowtimes
          .filter((showtime) => Number(showtime.movieId) === Number(selectedQuickMovie.id))
          .map((showtime) => showtime.showDate)
          .filter(Boolean),
      ),
    ).sort();
  }, [activeShowtimes, selectedQuickMovie]);
  const selectedQuickDate = quickDates.includes(quickDate) ? quickDate : quickDates[0] || "";
  const quickShowtimes = useMemo(() => {
    if (!selectedQuickMovie || !selectedQuickDate) return [];
    return activeShowtimes
      .filter(
        (showtime) =>
          Number(showtime.movieId) === Number(selectedQuickMovie.id) &&
          showtime.showDate === selectedQuickDate,
      )
      .sort((left, right) => String(left.startTime).localeCompare(String(right.startTime)));
  }, [activeShowtimes, selectedQuickDate, selectedQuickMovie]);
  const selectedQuickShowtime =
    quickShowtimes.find((showtime) => Number(showtime.id) === Number(quickShowtimeId)) ||
    quickShowtimes[0] ||
    null;
  const selectedScheduleMovie =
    scheduleMovies.find((movie) => Number(movie.id) === Number(selectedScheduleMovieId)) ||
    scheduleMovies[0] ||
    null;
  const selectedScheduleTheater =
    scheduleTheaters.find((theater) => Number(theater.id) === Number(selectedScheduleTheaterId)) ||
    scheduleTheaters[0] ||
    null;
  const hasScheduleData = activeShowtimes.length > 0;
  const hasSelectedScheduleTarget =
    scheduleMode === "movie" ? Boolean(selectedScheduleMovie) : Boolean(selectedScheduleTheater);
  const selectedTargetShowtimeDates = useMemo(() => {
    const targetShowtimes =
      scheduleMode === "movie"
        ? activeShowtimes.filter((showtime) => Number(showtime.movieId) === Number(selectedScheduleMovie?.id))
        : activeShowtimes.filter((showtime) => Number(showtime.theaterId) === Number(selectedScheduleTheater?.id));

    return Array.from(new Set(targetShowtimes.map((showtime) => showtime.showDate).filter(Boolean))).sort();
  }, [activeShowtimes, scheduleMode, selectedScheduleMovie, selectedScheduleTheater]);
  const scheduleDates = useMemo(() => {
    const today = toDateInputValue(new Date());
    const firstDateWithShowtime =
      selectedTargetShowtimeDates.find((date) => date >= today) || selectedTargetShowtimeDates[0];
    return buildScheduleDates(parseLocalDate(firstDateWithShowtime || today), 8);
  }, [selectedTargetShowtimeDates]);
  const selectedScheduleDate = selectedTargetShowtimeDates.includes(requestedScheduleDate)
    ? requestedScheduleDate
    : selectedTargetShowtimeDates.find((date) => date >= toDateInputValue(new Date())) ||
      selectedTargetShowtimeDates[0] ||
      requestedScheduleDate;

  const selectedMovieShowtimes = useMemo(() => {
    if (!selectedScheduleMovie) return [];
    return activeShowtimes.filter(
      (showtime) =>
        Number(showtime.movieId) === Number(selectedScheduleMovie.id) &&
        showtime.showDate === selectedScheduleDate,
    );
  }, [activeShowtimes, selectedScheduleDate, selectedScheduleMovie]);
  const selectedTheaterShowtimes = useMemo(() => {
    if (!selectedScheduleTheater) return [];
    return activeShowtimes.filter(
      (showtime) =>
        Number(showtime.theaterId) === Number(selectedScheduleTheater.id) &&
        showtime.showDate === selectedScheduleDate,
    );
  }, [activeShowtimes, selectedScheduleDate, selectedScheduleTheater]);
  const visibleScheduleShowtimes =
    scheduleMode === "movie" ? selectedMovieShowtimes : selectedTheaterShowtimes;
  const scheduleGroups = useMemo(() => {
    const groups = new Map();
    visibleScheduleShowtimes.forEach((showtime) => {
      const key =
        scheduleMode === "movie"
          ? `${showtime.theaterId}-${showtime.formatType || "2D"}`
          : `${showtime.movieId}-${showtime.formatType || "2D"}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          theater: theaterMap.get(Number(showtime.theaterId)),
          movie: displayMovies.find((movie) => Number(movie.id) === Number(showtime.movieId)),
          formatType: showtime.formatType || "2D",
          times: [],
        });
      }
      groups.get(key).times.push(showtime);
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      times: group.times.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    }));
  }, [displayMovies, scheduleMode, theaterMap, visibleScheduleShowtimes]);
  const availableGenres = useMemo(() => {
    const uniqueGenres = new Map();
    displayMovies.forEach((movie) => {
      splitGenres(movie.genre).forEach((genre) => {
        const label = normalizeClientText(genre);
        uniqueGenres.set(normalizeSearchValue(label), label);
      });
    });
    return Array.from(uniqueGenres.values()).sort((a, b) => a.localeCompare(b, "vi"));
  }, [displayMovies]);
  const availableReleaseYears = useMemo(
    () => {
      const currentYear = new Date().getFullYear();
      const yearRange = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index));
      const movieYears = displayMovies
        .map((movie) => String(movie.releaseDate || movie.releaseYear || "").slice(0, 4))
        .filter((year) => /^\d{4}$/.test(year));
      return Array.from(new Set([...yearRange, ...movieYears])).sort(
        (left, right) => Number(right) - Number(left),
      );
    },
    [displayMovies],
  );
  const activeFilterCount =
    Number(Boolean(appliedFilters.actor.trim())) +
    Number(Boolean(appliedFilters.director.trim())) +
    Number(Boolean(appliedFilters.ageRating)) +
    Number(Boolean(appliedFilters.releaseYear)) +
    appliedFilters.genres.length;

  const filteredMovies = useMemo(() => {
    const tabMovies = displayMovies.filter((movie) => movieMatchesTab(movie, activeTab));
    const baseMovies =
      tabMovies.length > 0 || hasActiveFilters(appliedFilters) ? tabMovies : [];
    return baseMovies.filter((movie) => movieMatchesFilters(movie, appliedFilters));
  }, [activeTab, appliedFilters, displayMovies]);

  const memberCode = useMemo(() => {
    const source = `${auth?.userId || ""}${auth?.fullName || ""}${auth?.email || ""}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    }
    return String(900000000000000 + hash).slice(0, 15);
  }, [auth]);

  const bookingTheater = bookingShowtime ? theaterMap.get(Number(bookingShowtime.theaterId)) : null;
  const bookingSeatRows = useMemo(() => groupSeatsByRow(bookingSeats), [bookingSeats]);
  const selectedBookingCombos = useMemo(
    () =>
      bookingCombos
        .map((combo) => ({
          ...combo,
          quantity: Number(bookingComboQuantities[combo.id] || 0),
        }))
        .filter((combo) => combo.quantity > 0),
    [bookingComboQuantities, bookingCombos],
  );
  const bookingTicketTotal = selectedBookingSeats.reduce((sum, seat) => sum + seatPrice(seat), 0);
  const bookingComboTotal = selectedBookingCombos.reduce(
    (sum, combo) => sum + Number(combo.price || 0) * combo.quantity,
    0,
  );
  const bookingTotal = bookingTicketTotal + bookingComboTotal;
  const bookingDiscountTotal = Number(appliedPromotion?.discountAmount || 0);
  const bookingPayableTotal = Math.max(0, bookingTotal - bookingDiscountTotal);

  const applySeatLocks = useCallback((seatLocks) => {
    const lockedIds = new Set();
    const ownIds = new Set();

    (seatLocks || []).forEach((seat) => {
      const seatId = seat.seatId || seat.id;
      if (!seatId) return;
      const normalizedSeatId = String(seatId);
      lockedIds.add(normalizedSeatId);
      if (seat.heldByCurrentUser === true) ownIds.add(normalizedSeatId);
    });

    setBookedSeatIds(lockedIds);
    setOwnHeldSeatIds(ownIds);
  }, []);

  const refreshBookedSeatIds = useCallback(async (showtimeId) => {
    const response = auth ? await getSeatLocks(showtimeId) : await getBookedSeats(showtimeId);
    applySeatLocks(response.data || []);
  }, [applySeatLocks, auth]);

  useEffect(() => {
    if (view !== "booking" || !bookingHoldExpiresAt) return undefined;

    const tick = () => {
      const remainingSeconds = Math.max(0, Math.ceil((bookingHoldExpiresAt - Date.now()) / 1000));
      setBookingHoldSeconds(remainingSeconds);

      if (remainingSeconds <= 0) {
        if (bookingShowtime?.id && auth) {
          holdBookingSeats({ showtimeId: bookingShowtime.id, seats: [] })
            .then(() => refreshBookedSeatIds(bookingShowtime.id))
            .catch(() => {});
        }
        setSelectedBookingSeats([]);
        setBookingComboQuantities({});
        setBookingStep(1);
        setBookingHoldExpiresAt(null);
        setBookingError("Hết thời gian giữ ghế. Vui lòng chọn lại ghế.");
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [auth, bookingHoldExpiresAt, bookingShowtime, refreshBookedSeatIds, view]);

  useEffect(() => {
    if (view !== "booking" || !bookingShowtime?.id) return undefined;

    let active = true;
    const refresh = () => {
      refreshBookedSeatIds(bookingShowtime.id)
        .then(() => {
          if (!active) return;
        })
        .catch(() => {});
    };

    refresh();
    const intervalId = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [bookingShowtime?.id, refreshBookedSeatIds, view]);

  useEffect(() => {
    if (view !== "home" || displayBanners.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % displayBanners.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [displayBanners.length, view]);

  const changeBanner = (direction) => {
    setBannerIndex((current) => {
      const next = current + direction;
      if (next < 0) return displayBanners.length - 1;
      return next % displayBanners.length;
    });
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthInfo("");
  };

  const closeAuthModal = () => {
    if (authLoading) return;
    setAuthMode(null);
    setAuthError("");
    setAuthInfo("");
  };

  const openFilterPanel = () => {
    setDraftFilters(appliedFilters);
    setFilterOpen(true);
    setView("home");
  };

  const closeFilterPanel = () => {
    setFilterOpen(false);
  };

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleDraftGenre = (genre) => {
    setDraftFilters((current) => {
      const selected = current.genres.includes(genre);
      return {
        ...current,
        genres: selected
          ? current.genres.filter((item) => item !== genre)
          : [...current.genres, genre],
      };
    });
  };

  const setDraftGenre = (genre) => {
    setDraftFilters((current) => ({
      ...current,
      genres: genre ? [genre] : [],
    }));
  };

  const applyHeaderMovieFilter = (type, value) => {
    const nextFilters = {
      ...initialMovieFilters,
      genres: type === "genre" && value ? [value] : [],
      releaseYear: type === "year" ? String(value || "") : "",
    };
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setActiveTab("all");
    setFilterOpen(false);
    setMenuOpen(false);
  };

  const applyMovieFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({
      actor: draftFilters.actor.trim(),
      director: draftFilters.director.trim(),
      genres: draftFilters.genres,
      ageRating: draftFilters.ageRating,
      releaseYear: draftFilters.releaseYear,
    });
    setActiveTab("all");
    setFilterOpen(false);
    setView("home");
    if (window.location.pathname === "/phim") window.history.replaceState({}, "", "/phim");
  };

  const resetMovieFilters = () => {
    setDraftFilters(initialMovieFilters);
    setAppliedFilters(initialMovieFilters);
    if (window.location.pathname === "/phim") window.history.replaceState({}, "", "/phim");
  };

  const openMovieDetail = (movie) => {
    const movieDates = Array.from(
      new Set(
        activeShowtimes
          .filter((showtime) => Number(showtime.movieId) === Number(movie.id))
          .map((showtime) => showtime.showDate)
          .filter(Boolean),
      ),
    ).sort();
    const today = toDateInputValue(new Date());
    const firstDate = movieDates.find((date) => date >= today) || movieDates[0] || today;

    setSelectedMovie(movie);
    setDetailScheduleDate(firstDate);
    setView("movieDetail");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const openBookingFlow = async (showtime, movieArg) => {
    const movie =
      movieArg ||
      displayMovies.find((item) => Number(item.id) === Number(showtime.movieId)) ||
      selectedScheduleMovie ||
      selectedMovie;

    setBookingShowtime(showtime);
    setBookingMovie(movie || null);
    if (movie) {
      setSelectedMovie(movie);
      setDetailScheduleDate(showtime.showDate || toDateInputValue(new Date()));
    }
    setBookingStep(1);
    setBookingSeats([]);
    setBookedSeatIds(new Set());
    setOwnHeldSeatIds(new Set());
    setSelectedBookingSeats([]);
    setBookingCombos([]);
    setBookingComboQuantities({});
    setBookingError("");
    setPromotionCode("");
    setAppliedPromotion(null);
    setPromotionMessage("");
    setSelectedPaymentMethod("VNPAY");
    setBookingHoldExpiresAt(null);
    setBookingHoldSeconds(BOOKING_HOLD_SECONDS);
    setView("booking");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);

    try {
      setBookingLoading(true);
      const [seatResult, bookedResult, foodResult] = await Promise.allSettled([
        getSeatsByRoom(showtime.roomId),
        auth ? getSeatLocks(showtime.id) : getBookedSeats(showtime.id),
        getFoods(),
      ]);

      if (seatResult.status === "fulfilled") {
        setBookingSeats(seatResult.value.data || []);
      }

      if (bookedResult.status === "fulfilled") {
        applySeatLocks(bookedResult.value.data || []);
      }

      if (foodResult.status === "fulfilled") {
        setBookingCombos(
          (foodResult.value.data || []).filter((food) => {
            const status = String(food.status || "").toUpperCase();
            const category = String(food.category || "").toUpperCase();
            return status !== "INACTIVE" && status !== "OUT_OF_STOCK" && (category === "COMBO" || food.name?.toLowerCase().includes("combo"));
          }),
        );
      }

      if (seatResult.status === "rejected") {
        setBookingError("Không tải được sơ đồ ghế. Kiểm tra lại showtime/room hoặc API ghế.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const buildSeatHoldPayload = (seats) => {
    const bookingTheater =
      theaters.find((theater) => Number(theater.id) === Number(bookingShowtime?.theaterId)) || {};

    return {
      showtimeId: bookingShowtime?.id,
      movieTitle: bookingMovie?.title || bookingShowtime?.movieTitle || bookingMovie?.name,
      theaterName: bookingTheater?.name || bookingShowtime?.theaterName || `Rạp #${bookingShowtime?.theaterId}`,
      roomName: bookingShowtime?.roomName || `Phòng #${bookingShowtime?.roomId}`,
      showDate: bookingShowtime?.showDate,
      startTime: bookingShowtime?.startTime,
      seats: seats.map((seat) => ({
        seatId: seat.id,
        seatCode: seat.seatCode,
        seatType: seat.seatType || "STANDARD",
        price: seatPrice(seat),
      })),
    };
  };

  const syncSeatHold = async (nextSeats, previousSeats) => {
    if (!bookingShowtime || !auth) return;

    try {
      await holdBookingSeats(buildSeatHoldPayload(nextSeats));
      await refreshBookedSeatIds(bookingShowtime.id);
    } catch (error) {
      setSelectedBookingSeats(previousSeats);
      if (previousSeats.length === 0) {
        setBookingHoldExpiresAt(null);
        setBookingHoldSeconds(BOOKING_HOLD_SECONDS);
      }
      await refreshBookedSeatIds(bookingShowtime.id).catch(() => {});
      setBookingError(errorMessage(error, "Ghế này vừa được người khác giữ. Vui lòng chọn ghế khác."));
    }
  };

  const updateSeatHoldTimer = (previousSeats, nextSeats) => {
    if (previousSeats.length === 0 && nextSeats.length > 0) {
      setBookingHoldExpiresAt(Date.now() + BOOKING_HOLD_SECONDS * 1000);
      setBookingHoldSeconds(BOOKING_HOLD_SECONDS);
      setBookingError("");
    }

    if (nextSeats.length === 0) {
      setBookingHoldExpiresAt(null);
      setBookingHoldSeconds(BOOKING_HOLD_SECONDS);
      setBookingComboQuantities({});
      setBookingStep(1);
    }
  };

  const toggleBookingSeat = (seat) => {
    if (!auth) {
      openAuthModal("login");
      return;
    }

    const selected = selectedBookingSeats.some((item) => Number(item.id) === Number(seat.id));
    const sold = bookedSeatIds.has(String(seat.id)) && !ownHeldSeatIds.has(String(seat.id));
    const status = String(seat.status || "ACTIVE").toUpperCase();
    if ((sold && !selected) || (status && status !== "ACTIVE")) return;

    const previousSeats = selectedBookingSeats;
    const nextSeats = selected
      ? previousSeats.filter((item) => Number(item.id) !== Number(seat.id))
      : [...previousSeats, seat];

    setSelectedBookingSeats(nextSeats);
    updateSeatHoldTimer(previousSeats, nextSeats);
    syncSeatHold(nextSeats, previousSeats);
  };

  const updateBookingComboQuantity = (comboId, delta) => {
    setBookingComboQuantities((current) => {
      const nextValue = Math.max(0, Number(current[comboId] || 0) + delta);
      return {
        ...current,
        [comboId]: nextValue,
      };
    });
  };

  const buildClientBookingPayload = () => ({
    userId: auth?.userId || auth?.id,
    customerName: auth?.fullName || "Khách hàng online",
    customerEmail: auth?.email || null,
    customerPhone: auth?.phone || null,
    showtimeId: bookingShowtime.id,
    movieTitle: bookingMovie?.title || bookingShowtime.movieName,
    theaterName: bookingTheater?.name || `Rạp #${bookingShowtime.theaterId}`,
    roomName: bookingShowtime.roomName || `Phòng #${bookingShowtime.roomId}`,
    showDate: bookingShowtime.showDate,
    startTime: bookingShowtime.startTime,
    promotionCode: appliedPromotion?.code || null,
    discountAmount: bookingDiscountTotal,
    seats: selectedBookingSeats.map((seat) => ({
      seatId: seat.id,
      seatCode: seat.seatCode,
      seatType: seat.seatType || "STANDARD",
      price: seatPrice(seat),
    })),
    foods: selectedBookingCombos.map((combo) => ({
      foodId: combo.id,
      foodName: combo.name,
      quantity: combo.quantity,
      unitPrice: Number(combo.price || 0),
      totalPrice: Number(combo.price || 0) * combo.quantity,
    })),
  });

  const handleApplyPromotion = async () => {
    const code = promotionCode.trim();
    if (!code) {
      setPromotionMessage("Vui lòng nhập mã khuyến mãi.");
      setAppliedPromotion(null);
      return;
    }

    try {
      setBookingLoading(true);
      const response = await applyPromotion({
        code,
        orderAmount: bookingTotal,
      });
      setAppliedPromotion(response.data);
      setPromotionMessage(response.data?.message || "Áp dụng mã khuyến mãi thành công.");
    } catch (error) {
      setAppliedPromotion(null);
      setPromotionMessage(errorMessage(error, "Mã khuyến mãi không hợp lệ."));
    } finally {
      setBookingLoading(false);
    }
  };

  const clearPromotion = () => {
    setPromotionCode("");
    setAppliedPromotion(null);
    setPromotionMessage("");
  };

  const submitClientBooking = async () => {
    if (!auth) {
      openAuthModal("login");
      return;
    }
    if (!bookingShowtime || selectedBookingSeats.length === 0) {
      setBookingError("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");
      const response = await createBooking(buildClientBookingPayload());
      const booking = response.data;

      if (selectedPaymentMethod === "VNPAY") {
        const paymentResponse = await createVnpayPayment({
          bookingId: booking.id,
          userId: auth?.userId || auth?.id,
          amount: booking.totalAmount || bookingPayableTotal,
          provider: "VNPAY",
          paymentMethod: "VNPAY_QR",
          description: `Thanh toán vé ${booking.bookingCode || booking.id}`,
        });
        const paymentUrl = paymentResponse.data?.paymentUrl;
        if (!paymentUrl) throw new Error("Không tạo được URL thanh toán VNPAY.");
        window.location.href = paymentUrl;
        return;
      }
      alert(`Đặt vé thành công. Mã đặt vé: ${response.data?.bookingCode || response.data?.id}`);
      await openBookingFlow(bookingShowtime, bookingMovie);
    } catch (error) {
      setBookingError(errorMessage(error, "Đặt vé thất bại."));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthInfo("");

    if (!loginForm.email.trim() || !loginForm.password) {
      setAuthError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await loginUser({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      const nextAuth = {
        ...response.data,
        email: response.data?.email || loginForm.email.trim().toLowerCase(),
      };
      saveClientAuth(nextAuth, loginForm.remember);
      setAuth(nextAuth);
      setAuthMode(null);
      setView((currentView) => (currentView === "booking" ? "booking" : "account"));
    } catch (error) {
      setAuthError(errorMessage(error, "Đăng nhập thất bại."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthInfo("");

    if (!registerForm.fullName.trim()) {
      setAuthError("Vui lòng nhập họ tên.");
      return;
    }
    if (!registerForm.email.includes("@")) {
      setAuthError("Email không hợp lệ.");
      return;
    }
    if (registerForm.password.length < 6) {
      setAuthError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await registerUser({
        fullName: registerForm.fullName.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
      });
      setRegisterForm(initialRegisterForm);
      setAuthInfo(
        response.data?.message ||
          "Đăng ký thành công. Bạn có thể đăng nhập ngay. Vào hồ sơ cá nhân để gửi email xác nhận ưu đãi khi cần.",
      );
    } catch (error) {
      setAuthError(errorMessage(error, "Đăng ký thất bại."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth?.refreshToken) {
        await logoutUser(auth.refreshToken);
      }
    } catch {
      // Client cleanup is still required even if server logout fails.
    } finally {
      clearClientAuth();
      setAuth(null);
      setView("home");
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!auth?.email) {
      setVerificationMessage("Không tìm thấy email tài khoản.");
      return;
    }

    try {
      setVerificationSending(true);
      setVerificationMessage("");
      const response = await resendVerificationEmail(auth.email);
      setVerificationMessage(
        typeof response.data === "string"
          ? response.data
          : response.data?.message || "Đã gửi email xác nhận ưu đãi. Vui lòng kiểm tra hộp thư.",
      );
    } catch (error) {
      setVerificationMessage(errorMessage(error, "Không gửi được email xác nhận. Vui lòng thử lại sau."));
    } finally {
      setVerificationSending(false);
    }
  };


  return {
    accountTab,
    activeFilterCount,
    activeShowtimes,
    activeTab,
    appliedPromotion,
    applyMovieFilters,
    applyHeaderMovieFilter,
    auth,
    authError,
    authInfo,
    authLoading,
    authMode,
    availableGenres,
    availableReleaseYears,
    bannerIndex,
    bookedSeatIds,
    bookingComboQuantities,
    bookingComboTotal,
    bookingCombos,
    bookingDiscountTotal,
    bookingError,
    bookingHoldSeconds,
    bookingLoading,
    bookingMovie,
    bookingPayableTotal,
    bookingSeatRows,
    bookingShowtime,
    bookingStep,
    bookingTheater,
    bookingTicketTotal,
    bookingTotal,
    changeBanner,
    clearPromotion,
    closeAuthModal,
    closeFilterPanel,
    currentBanner,
    detailScheduleDate,
    displayBanners,
    displayMovies,
    draftFilters,
    filterOpen,
    filteredMovies,
    handleApplyPromotion,
    handleLogin,
    handleLogout,
    handleRegister,
    handleResendVerificationEmail,
    hasScheduleData,
    hasSelectedScheduleTarget,
    loginForm,
    memberCode,
    menuOpen,
    openAuthModal,
    openBookingFlow,
    openFilterPanel,
    openMovieDetail,
    ownHeldSeatIds,
    promotionCode,
    promotionMessage,
    quickDates,
    quickShowtimes,
    registerForm,
    resetMovieFilters,
    scheduleDates,
    scheduleGroups,
    scheduleMode,
    scheduleMovies,
    scheduleTheaters,
    selectedBookingCombos,
    selectedBookingSeats,
    selectedMovie,
    selectedPaymentMethod,
    selectedQuickDate,
    selectedQuickMovie,
    selectedQuickShowtime,
    selectedScheduleDate,
    selectedScheduleMovie,
    selectedScheduleTheater,
    setAccountTab,
    setActiveTab,
    setAuthInfo,
    setBannerIndex,
    setBookingStep,
    setDetailScheduleDate,
    setDraftGenre,
    setLoginForm,
    setMenuOpen,
    setPromotionCode,
    setQuickDate,
    setQuickMovieId,
    setQuickShowtimeId,
    setRegisterForm,
    setScheduleMode,
    setSelectedPaymentMethod,
    setSelectedScheduleDate,
    setSelectedScheduleMovieId,
    setSelectedScheduleTheaterId,
    setView,
    submitClientBooking,
    theaterMap,
    toggleBookingSeat,
    toggleDraftGenre,
    updateBookingComboQuantity,
    updateDraftFilter,
    verificationMessage,
    verificationSending,
    view,
  };
}

export default useClientHomeController;
