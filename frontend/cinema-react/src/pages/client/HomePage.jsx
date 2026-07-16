import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdvertisements } from "../../api/advertisementApi";
import { loginUser, logoutUser, registerUser, resendVerificationEmail } from "../../api/authApi";
import { createBooking, getBookedSeats, getSeatLocks, holdBookingSeats } from "../../api/bookingApi";
import { getFoods } from "../../api/foodApi";
import { getMovies } from "../../api/movieApi";
import { createVnpayPayment } from "../../api/paymentApi";
import { applyPromotion } from "../../api/promotionApi";
import { getSeatsByRoom } from "../../api/seatApi";
import { getShowtimes } from "../../api/showtimeApi";
import { getTheaters } from "../../api/theaterApi";
import {
  BOOKING_HOLD_SECONDS,
  fallbackBanners,
  fallbackMovies,
  initialLoginForm,
  initialMovieFilters,
  initialRegisterForm,
} from "./home/clientHomeData";
import {
  buildScheduleDates,
  clearClientAuth,
  errorMessage,
  formatDuration,
  formatHoldTime,
  formatMoney,
  formatShowtimeTime,
  getAgeDescription,
  getAgeRating,
  getPoster,
  getTrailerEmbedUrl,
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
} from "./home/clientHomeUtils";
import BookingPaymentStep from "./home/components/BookingPaymentStep";
import ClientAuthModal from "./home/components/ClientAuthModal";
import ClientFooter from "./home/components/ClientFooter";
import ClientNewsEventsSection from "./home/components/ClientNewsEventsSection";
import ClientTransactionHistory from "./home/components/ClientTransactionHistory";
import "../../styles/client-home.css";
function HomePage() {
  const [movies, setMovies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [activeTab, setActiveTab] = useState("now");
  const [scheduleMode, setScheduleMode] = useState("movie");
  const [selectedScheduleMovieId, setSelectedScheduleMovieId] = useState(null);
  const [selectedScheduleTheaterId, setSelectedScheduleTheaterId] = useState(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => toDateInputValue(new Date()));
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
  const [draftFilters, setDraftFilters] = useState(initialMovieFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialMovieFilters);
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

  useEffect(() => {
    if (selectedTargetShowtimeDates.length === 0) return;
    if (selectedTargetShowtimeDates.includes(selectedScheduleDate)) return;

    const today = toDateInputValue(new Date());
    const nextDate = selectedTargetShowtimeDates.find((date) => date >= today) || selectedTargetShowtimeDates[0];
    if (nextDate && nextDate !== selectedScheduleDate) {
      setSelectedScheduleDate(nextDate);
    }
  }, [selectedScheduleDate, selectedTargetShowtimeDates]);

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
  const activeFilterCount =
    Number(Boolean(appliedFilters.actor.trim())) +
    Number(Boolean(appliedFilters.director.trim())) +
    Number(Boolean(appliedFilters.ageRating)) +
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
  }, [auth, bookingHoldExpiresAt, bookingShowtime, view]);

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
  }, [bookingShowtime?.id, view]);

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

  const applyMovieFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({
      actor: draftFilters.actor.trim(),
      director: draftFilters.director.trim(),
      genres: draftFilters.genres,
      ageRating: draftFilters.ageRating,
    });
    setFilterOpen(false);
    setView("home");
  };

  const resetMovieFilters = () => {
    setDraftFilters(initialMovieFilters);
    setAppliedFilters(initialMovieFilters);
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

  const applySeatLocks = (seatLocks) => {
    const lockedIds = new Set();
    const ownIds = new Set();

    (seatLocks || []).forEach((seat) => {
      const seatId = seat.seatId || seat.id;
      if (!seatId) return;
      const normalizedSeatId = String(seatId);
      lockedIds.add(normalizedSeatId);
      if (seat.heldByCurrentUser === true) {
        ownIds.add(normalizedSeatId);
      }
    });

    setBookedSeatIds(lockedIds);
    setOwnHeldSeatIds(ownIds);
  };

  const refreshBookedSeatIds = async (showtimeId) => {
    const response = auth ? await getSeatLocks(showtimeId) : await getBookedSeats(showtimeId);
    applySeatLocks(response.data || []);
  };

  const refreshPublicBookedSeatIds = async (showtimeId) => {
    const response = await getBookedSeats(showtimeId);
    setBookedSeatIds(
      new Set(
        (response.data || [])
          .map((seat) => seat.seatId || seat.id)
          .filter(Boolean)
          .map(String),
      ),
    );
    setOwnHeldSeatIds(new Set());
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

  const renderHome = () => (
    <main className="client-main">
      <section className="client-hero" aria-label="Banner phim">
        <button type="button" className="hero-arrow left" onClick={() => changeBanner(-1)}>
          ‹
        </button>
        <img src={currentBanner.imageUrl} alt={currentBanner.title || "Cinema banner"} />
        {currentBanner.title && (
          <div className="hero-caption">
            <span>HMCinema</span>
            <strong>{currentBanner.title}</strong>
          </div>
        )}
        <button type="button" className="hero-arrow right" onClick={() => changeBanner(1)}>
          ›
        </button>
        {displayBanners.length > 1 && (
          <div className="hero-dots" aria-label="Chọn banner">
            {displayBanners.map((banner, index) => (
              <button
                key={banner.id || banner.imageUrl || index}
                type="button"
                className={index === bannerIndex % displayBanners.length ? "active" : ""}
                aria-label={`Banner ${index + 1}`}
                onClick={() => setBannerIndex(index)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="client-movies" id="movies">
        <div className="movie-tabs">
          <button
            type="button"
            className={activeTab === "now" ? "active" : ""}
            onClick={() => setActiveTab("now")}
          >
            Phim đang chiếu
          </button>
          <button
            type="button"
            className={activeTab === "coming" ? "active" : ""}
            onClick={() => setActiveTab("coming")}
          >
            Phim sắp chiếu
          </button>
          <button
            type="button"
            className={activeTab === "advance" ? "active" : ""}
            onClick={() => setActiveTab("advance")}
          >
            Vé Bán Trước
          </button>
          <button type="button" className="filter-toggle" onClick={openFilterPanel}>
            <span aria-hidden="true">▼</span> Bộ lọc
            {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
          </button>
        </div>

        <div className="client-movie-grid">
          {filteredMovies.length === 0 ? (
            <div className="movie-filter-empty">
              Không có phim phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredMovies.map((movie) => {
            const rating = getAgeRating(movie);
            return (
              <article
                className="client-movie-card"
                key={movie.id}
                role="button"
                tabIndex={0}
                onClick={() => openMovieDetail(movie)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMovieDetail(movie);
                  }
                }}
              >
                <div className="movie-poster">
                  {getPoster(movie) ? <img src={getPoster(movie)} alt={movie.title} /> : <span>No Image</span>}
                </div>

                <div className="movie-info">
                  <h3>{normalizeClientText(movie.title)}</h3>
                  <p className="duration">{formatDuration(movie.duration)}</p>
                  <p>
                    Thể loại: <a href="#movies">{normalizeClientText(movie.genre || "Đang cập nhật")}</a>
                  </p>
                  <p>Đạo diễn: {normalizeClientText(movie.director || "Đang cập nhật")}</p>
                  <p>Diễn viên: {normalizeClientText(movie.cast || movie.actors || "Đang cập nhật")}</p>
                  <p className="movie-rating">
                    Rated: <span>{rating}</span> - {getAgeDescription(rating)}
                  </p>
                </div>
              </article>
            );
          }))}
        </div>
      </section>

      <section className="client-schedule" id="schedule">
        <div className="schedule-tabs">
          <button
            type="button"
            className={scheduleMode === "movie" ? "active" : ""}
            onClick={() => setScheduleMode("movie")}
          >
            Lịch chiếu theo phim
          </button>
          <button
            type="button"
            className={scheduleMode === "theater" ? "active" : ""}
            onClick={() => setScheduleMode("theater")}
          >
            Lịch chiếu theo rạp
          </button>
        </div>

        {!hasScheduleData ? (
          <div className="schedule-empty">Chưa có lịch chiếu từ hệ thống.</div>
        ) : scheduleMode === "movie" ? (
          <>
            <div className="schedule-movie-strip">
              {scheduleMovies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  className={Number(selectedScheduleMovie?.id) === Number(movie.id) ? "active" : ""}
                  onClick={() => setSelectedScheduleMovieId(movie.id)}
                >
                  {getPoster(movie) ? <img src={getPoster(movie)} alt={movie.title} /> : <span>No Image</span>}
                </button>
              ))}
            </div>

            {selectedScheduleMovie && (
              <div className="schedule-movie-detail">
                <div className="schedule-detail-poster">
                  {getPoster(selectedScheduleMovie) ? (
                    <img src={getPoster(selectedScheduleMovie)} alt={selectedScheduleMovie.title} />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>
                <div className="schedule-detail-info">
                  <h2>{normalizeClientText(selectedScheduleMovie.title)}</h2>
                  <p className="duration">{formatDuration(selectedScheduleMovie.duration)}</p>
                  <p>
                    Thể loại: <a href="#movies">{normalizeClientText(selectedScheduleMovie.genre || "Đang cập nhật")}</a>
                  </p>
                  <p>Đạo diễn: {normalizeClientText(selectedScheduleMovie.director || "Đang cập nhật")}</p>
                  <p>Diễn viên: {normalizeClientText(selectedScheduleMovie.cast || selectedScheduleMovie.actors || "Đang cập nhật")}</p>
                  <p className="movie-rating">
                    Giới hạn độ tuổi: <span>{getAgeRating(selectedScheduleMovie)}</span> -{" "}
                    {getAgeDescription(getAgeRating(selectedScheduleMovie))}
                  </p>
                </div>
                <div className="schedule-trailer">
                  <h3>Trailer</h3>
                  {getTrailerEmbedUrl(selectedScheduleMovie) ? (
                    <iframe
                      src={getTrailerEmbedUrl(selectedScheduleMovie)}
                      title={`Trailer ${selectedScheduleMovie.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="trailer-empty">Phim này chưa có trailer.</div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="schedule-theater-select">
            <label>
              <span>Chọn rạp</span>
              <select
                value={selectedScheduleTheater?.id || ""}
                onChange={(event) => setSelectedScheduleTheaterId(event.target.value)}
              >
                {scheduleTheaters.map((theater) => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {hasScheduleData && hasSelectedScheduleTarget && (
          <>
            <div className="schedule-date-row">
          {scheduleDates.map((date) => (
            <button
              key={date.value}
              type="button"
              className={selectedScheduleDate === date.value ? "active" : ""}
              onClick={() => setSelectedScheduleDate(date.value)}
            >
              {date.label}
            </button>
          ))}
        </div>

        <div className="schedule-list">
          <h2>Lịch Chiếu Phim</h2>
              {scheduleGroups.length === 0 ? (
                <div className="schedule-empty" role="status">
                  Chưa có lịch chiếu ngày này.
                </div>
          ) : (
            scheduleGroups.map((group) => (
              <div className="schedule-row" key={group.key}>
                <div className="schedule-row-title">
                  {scheduleMode === "movie"
                    ? normalizeClientText(group.theater?.name || `Rạp #${group.times[0]?.theaterId}`)
                    : normalizeClientText(group.movie?.title || group.times[0]?.movieName)}
                </div>
                <div className="schedule-row-times">
                  <strong>{group.formatType}</strong>
                  <div>
                    {group.times.map((showtime) => (
                      <button
                        key={showtime.id}
                        type="button"
                        onClick={() => openBookingFlow(showtime, group.movie || selectedScheduleMovie)}
                      >
                        {formatShowtimeTime(showtime.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
              )}
            </div>
          </>
        )}
      </section>

      <ClientNewsEventsSection />
    </main>
  );

  const renderAccount = () => (
    <main className="client-account-page">
      <section className="account-card">
        <aside className="account-sidebar">
          <h2>{auth?.fullName || "Thành viên"}</h2>
          <button type="button" className={accountTab === "profile" ? "active" : ""} onClick={() => setAccountTab("profile")}>
            🏠 Tài khoản
          </button>
          <button type="button" className={accountTab === "password" ? "active" : ""} onClick={() => setAccountTab("password")}>🔑 Mật khẩu</button>
          <button type="button" className={accountTab === "history" ? "active" : ""} onClick={() => setAccountTab("history")}>↺ Lịch sử giao dịch</button>
        </aside>

        <div className="account-content">
          {accountTab === "profile" && (
            <>
              <div className="member-card">
                <h1>Thẻ thành viên</h1>
                <div className="barcode" aria-label="Mã thành viên">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span key={index} style={{ width: index % 4 === 0 ? 4 : 2 }} />
                  ))}
                </div>
                <p>{memberCode}</p>
              </div>

              <div className="profile-form">
                <label>
                  <span>Họ tên</span>
                  <input value={auth?.fullName || ""} readOnly />
                </label>

                <div className="profile-row">
                  <label>
                    <span>Email</span>
                    <input value={auth?.email || ""} readOnly />
                  </label>
                  <label>
                    <span>Số điện thoại</span>
                    <input value={auth?.phone || ""} readOnly />
                  </label>
                </div>

                {auth?.emailVerified === false && (
                  <div className="verify-note">
                    <div>
                      <strong>Xác nhận email để nhận ưu đãi</strong>
                      <span>Bạn vẫn có thể dùng website bình thường. Email chỉ cần xác nhận khi muốn nhận khuyến mãi và ưu đãi thành viên.</span>
                    </div>
                    <button type="button" onClick={handleResendVerificationEmail} disabled={verificationSending}>
                      {verificationSending ? "Đang gửi..." : "Gửi email xác nhận"}
                    </button>
                  </div>
                )}

                {verificationMessage && <p className="verify-message">{verificationMessage}</p>}
              </div>

              <div className="member-stats">
                <div>
                  <strong>Cấp độ thẻ</strong>
                  <span>Member</span>
                </div>
                <div>
                  <strong>Tổng chi tiêu</strong>
                  <span>0 VNĐ</span>
                </div>
                <div>
                  <strong>Điểm</strong>
                  <span>0 P</span>
                </div>
              </div>

              <button type="button" className="account-update">
                Cập nhật
              </button>
            </>
          )}

          {accountTab === "password" && (
            <section className="account-password-placeholder">
              <h2>Đổi mật khẩu</h2>
              <p>Chức năng đổi mật khẩu sẽ được cấu hình ở bước tài khoản tiếp theo.</p>
            </section>
          )}

          {accountTab === "history" && (
            <ClientTransactionHistory auth={auth} />
          )}
        </div>
      </section>
    </main>
  );

  const renderMovieDetail = () => {
    if (!selectedMovie) return renderHome();

    const rating = getAgeRating(selectedMovie);
    const trailerEmbedUrl = getTrailerEmbedUrl(selectedMovie);
    const movieShowtimeDates = Array.from(
      new Set(
        activeShowtimes
          .filter((showtime) => Number(showtime.movieId) === Number(selectedMovie.id))
          .map((showtime) => showtime.showDate)
          .filter(Boolean),
      ),
    ).sort();
    const today = toDateInputValue(new Date());
    const firstDateWithShowtime = movieShowtimeDates.find((date) => date >= today) || movieShowtimeDates[0];
    const detailDates = buildScheduleDates(parseLocalDate(firstDateWithShowtime || today), 8);
    const detailShowtimes = activeShowtimes.filter(
      (showtime) =>
        Number(showtime.movieId) === Number(selectedMovie.id) &&
        showtime.showDate === detailScheduleDate,
    );
    const detailGroups = Array.from(
      detailShowtimes
        .reduce((groups, showtime) => {
          const key = `${showtime.theaterId}-${showtime.formatType || "2D"}`;
          if (!groups.has(key)) {
            groups.set(key, {
              key,
              theater: theaterMap.get(Number(showtime.theaterId)),
              formatType: showtime.formatType || "2D",
              times: [],
            });
          }
          groups.get(key).times.push(showtime);
          return groups;
        }, new Map())
        .values(),
    ).map((group) => ({
      ...group,
      times: group.times.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    }));

    return (
      <main className="client-main movie-detail-page">
        <button type="button" className="movie-detail-back" onClick={() => setView("home")}>
          ← Quay lại danh sách phim
        </button>

        <section className="movie-detail-hero">
          <div className="movie-detail-poster">
            {getPoster(selectedMovie) ? (
              <img src={getPoster(selectedMovie)} alt={selectedMovie.title} />
            ) : (
              <span>No Image</span>
            )}
          </div>

          <div className="movie-detail-content">
            <h1>{normalizeClientText(selectedMovie.title)}</h1>
            <p className="duration">{formatDuration(selectedMovie.duration)}</p>
            <p>
              <strong>Thể loại:</strong> {normalizeClientText(selectedMovie.genre || "Đang cập nhật")}
            </p>
            <p>
              <strong>Đạo diễn:</strong> {normalizeClientText(selectedMovie.director || "Đang cập nhật")}
            </p>
            <p>
              <strong>Diễn viên:</strong> {normalizeClientText(selectedMovie.cast || selectedMovie.actors || "Đang cập nhật")}
            </p>
            <p className="movie-rating">
              <strong>Giới hạn độ tuổi:</strong> <span>{rating}</span> - {getAgeDescription(rating)}
            </p>
            <div className="movie-detail-description">
              <h2>Nội dung</h2>
              <p>{normalizeClientText(selectedMovie.description || "Nội dung phim đang được cập nhật.")}</p>
            </div>
          </div>
        </section>

        <section className="movie-detail-trailer">
          <h2>Trailer</h2>
          {trailerEmbedUrl ? (
            <iframe
              src={trailerEmbedUrl}
              title={`Trailer ${selectedMovie.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="trailer-empty">Phim này chưa có trailer.</div>
          )}
        </section>

        <section className="movie-detail-schedule">
          <h2>Lịch Chiếu Phim</h2>
          {movieShowtimeDates.length === 0 ? (
            <div className="schedule-empty" role="status">
              Phim này chưa có lịch chiếu.
            </div>
          ) : (
            <>
              <div className="schedule-date-row">
                {detailDates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    className={detailScheduleDate === date.value ? "active" : ""}
                    onClick={() => setDetailScheduleDate(date.value)}
                  >
                    {date.label}
                  </button>
                ))}
              </div>

              {detailGroups.length === 0 ? (
                <div className="schedule-empty" role="status">
                  Chưa có lịch chiếu ngày này.
                </div>
              ) : (
                detailGroups.map((group) => (
                  <div className="schedule-row" key={group.key}>
                    <div className="schedule-row-title">
                      {normalizeClientText(group.theater?.name || `Rạp #${group.times[0]?.theaterId}`)}
                    </div>
                    <div className="schedule-row-times">
                      <strong>{group.formatType}</strong>
                      <div>
                        {group.times.map((showtime) => (
                          <button key={showtime.id} type="button" onClick={() => openBookingFlow(showtime, selectedMovie)}>
                            {formatShowtimeTime(showtime.startTime)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </section>
      </main>
    );
  };

  const renderBooking = () => {
    if (!bookingShowtime || !bookingMovie) return renderHome();

    const rating = getAgeRating(bookingMovie);
    const showtimeLabel = `${bookingShowtime.showDate || ""} ${formatShowtimeTime(bookingShowtime.startTime)}`;
    const roomName = normalizeClientText(bookingShowtime.roomName || `Phòng #${bookingShowtime.roomId}`);
    const selectedSeatCodes = selectedBookingSeats.map((seat) => seat.seatCode).join(", ");
    const selectedComboText = selectedBookingCombos.map((combo) => `${combo.name} x${combo.quantity}`).join(", ");

    return (
      <main className="client-booking-page">
        <button type="button" className="movie-detail-back" onClick={() => setView("movieDetail")}>
          ← Quay lại chi tiết phim
        </button>

        <section className="client-booking-layout">
          <aside className="booking-side-panel">
            <div className="booking-side-poster">
              {getPoster(bookingMovie) ? <img src={getPoster(bookingMovie)} alt={bookingMovie.title} /> : <span>No Image</span>}
            </div>
            <h2>{normalizeClientText(bookingMovie.title)}</h2>
            <p>
              Suất chiếu: <strong>{showtimeLabel}</strong>
            </p>
            <p>
              Rạp: <strong>{bookingTheater?.name || `Rạp #${bookingShowtime.theaterId}`}</strong>
            </p>
            <p>
              Phòng: <strong>{roomName}</strong>
            </p>
            <p className="booking-age">
              Giới hạn độ tuổi: <span>{rating}</span> - {getAgeDescription(rating)}
            </p>
            <div className="booking-side-summary">
              <p>🍿 Combo: <strong>{selectedComboText || "—"}</strong></p>
              <p>💺 Ghế: <strong>{selectedSeatCodes || "—"}</strong></p>
              <p>= Tổng Tiền: <strong>{formatMoney(bookingPayableTotal)}</strong></p>
              {selectedBookingSeats.length > 0 && (
                <div className={`booking-hold-timer ${bookingHoldSeconds <= 60 ? "danger" : ""}`}>
                  <span>Thời gian giữ ghế</span>
                  <strong>{formatHoldTime(bookingHoldSeconds)}</strong>
                </div>
              )}
            </div>
          </aside>

          <section className="booking-step-panel">
            <div className="booking-step-tabs">
              <button className={bookingStep === 1 ? "active" : ""} type="button" onClick={() => setBookingStep(1)}>
                1. Chọn Ghế
              </button>
              <button
                className={bookingStep === 2 ? "active" : ""}
                type="button"
                onClick={() => selectedBookingSeats.length > 0 && setBookingStep(2)}
              >
                2. Chọn Combo
              </button>
              <button
                className={bookingStep === 3 ? "active" : ""}
                type="button"
                onClick={() => selectedBookingSeats.length > 0 && setBookingStep(3)}
                disabled={selectedBookingSeats.length === 0}
              >
                3. Thanh toán
              </button>
            </div>

            {bookingError && <div className="booking-error">{bookingError}</div>}

            {bookingStep === 1 ? (
              <div className="booking-seat-section">
                <h1>Chọn Ghế</h1>
                <div className="booking-room-name">{roomName}</div>
                <div className="booking-seat-legend">
                  <span><i className="standard" /> 85,000 đ</span>
                  <span><i className="vip" /> 105,000 đ</span>
                  <span><i className="couple" /> 115,000 đ</span>
                  <span><i className="selected" /> Ghế đang chọn</span>
                  <span><i className="sold" /> Ghế đã bán</span>
                  <span><i className="maintenance" /> Ghế bảo trì</span>
                </div>
                <div className="booking-screen">Màn hình</div>

                {bookingLoading ? (
                  <div className="schedule-empty">Đang tải sơ đồ ghế...</div>
                ) : bookingSeatRows.length === 0 ? (
                  <div className="schedule-empty">Phòng này chưa có sơ đồ ghế.</div>
                ) : (
                  <div className="client-seat-map">
                    {bookingSeatRows.map((row) => (
                      <div className="client-seat-row" key={row.row}>
                        {row.seats.map((seat) => {
                          const status = String(seat.status || "ACTIVE").toUpperCase();
                          const maintenance = status && status !== "ACTIVE";
                          const selected = selectedBookingSeats.some((item) => Number(item.id) === Number(seat.id));
                          const ownHeld = ownHeldSeatIds.has(String(seat.id));
                          const sold = bookedSeatIds.has(String(seat.id)) && !ownHeld && !selected;
                          const typeClass = String(seat.seatType || "STANDARD").toLowerCase();

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              className={`client-seat-cell ${typeClass} ${sold ? "sold" : ""} ${maintenance ? "maintenance" : ""} ${
                                selected ? "selected" : ""
                              }`}
                              onClick={() => toggleBookingSeat(seat)}
                              disabled={sold || maintenance}
                              title={`${seat.seatCode} - ${formatMoney(seatPrice(seat))}`}
                            >
                            {maintenance ? "X" : selected ? "✓" : seat.seatCode}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div className="client-booking-actions">
                  <button type="button" disabled={selectedBookingSeats.length === 0 || bookingLoading} onClick={() => setBookingStep(2)}>
                    Tiếp theo
                  </button>
                </div>
              </div>
            ) : bookingStep === 2 ? (
              <div className="booking-combo-section">
                <h1>Chọn Combo</h1>
                {bookingLoading ? (
                  <div className="schedule-empty">Đang tải combo...</div>
                ) : bookingCombos.length === 0 ? (
                  <div className="schedule-empty">Chưa có combo đang bán.</div>
                ) : (
                  <div className="client-combo-grid">
                    {bookingCombos.map((combo) => (
                      <article className="client-combo-card" key={combo.id}>
                        <div className="combo-image">
                          {combo.imageUrl ? <img src={combo.imageUrl} alt={combo.name} /> : <span>No Image</span>}
                        </div>
                        <div className="combo-info">
                          <h2>{combo.name}</h2>
                          <p>{combo.description || "Combo bắp nước tại rạp"}</p>
                          <p>
                            Giá: <strong>{formatMoney(combo.price)}</strong>
                          </p>
                          <div className="combo-quantity">
                            <button type="button" onClick={() => updateBookingComboQuantity(combo.id, -1)}>
                              −
                            </button>
                            <input value={bookingComboQuantities[combo.id] || 0} readOnly />
                            <button type="button" onClick={() => updateBookingComboQuantity(combo.id, 1)}>
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="client-booking-actions">
                  <button type="button" className="secondary" onClick={() => setBookingStep(1)}>
                    Trở lại
                  </button>
                  <button type="button" disabled={bookingLoading} onClick={() => setBookingStep(3)}>
                    Tiếp theo
                  </button>
                </div>
              </div>
            ) : (
              <BookingPaymentStep
                bookingTicketTotal={bookingTicketTotal}
                bookingComboTotal={bookingComboTotal}
                bookingDiscountTotal={bookingDiscountTotal}
                bookingPayableTotal={bookingPayableTotal}
                promotionCode={promotionCode}
                setPromotionCode={setPromotionCode}
                appliedPromotion={appliedPromotion}
                promotionMessage={promotionMessage}
                bookingLoading={bookingLoading}
                bookingTotal={bookingTotal}
                handleApplyPromotion={handleApplyPromotion}
                clearPromotion={clearPromotion}
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                setBookingStep={setBookingStep}
                submitClientBooking={submitClientBooking}
              />            )}
          </section>
        </section>
      </main>
    );
  };

  const renderFilterPanel = () => (
    <div className={`movie-filter-overlay ${filterOpen ? "open" : ""}`} aria-hidden={!filterOpen}>
      <button
        type="button"
        className="movie-filter-backdrop"
        aria-label="Đóng bộ lọc"
        onClick={closeFilterPanel}
      />
      <aside className="movie-filter-drawer" aria-label="Bộ lọc phim">
        <div className="filter-drawer-head">
          <h2>Bộ lọc</h2>
          <button type="button" onClick={closeFilterPanel} aria-label="Đóng bộ lọc">
            ×
          </button>
        </div>

        <form className="filter-drawer-form" onSubmit={applyMovieFilters}>
          <label>
            <span>Diễn viên</span>
            <input
              value={draftFilters.actor}
              onChange={(event) => updateDraftFilter("actor", event.target.value)}
              placeholder="Nhập tên diễn viên"
            />
          </label>

          <label>
            <span>Đạo diễn</span>
            <input
              value={draftFilters.director}
              onChange={(event) => updateDraftFilter("director", event.target.value)}
              placeholder="Nhập tên đạo diễn"
            />
          </label>

          <div className="filter-field">
            <span>Thể loại</span>
            <div className="genre-filter-box">
              {draftFilters.genres.length === 0 ? (
                <em>Chọn thể loại</em>
              ) : (
                draftFilters.genres.map((genre) => (
                  <button key={genre} type="button" onClick={() => toggleDraftGenre(genre)}>
                    × {genre}
                  </button>
                ))
              )}
            </div>

            <div className="genre-filter-options">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={draftFilters.genres.includes(genre) ? "selected" : ""}
                  onClick={() => toggleDraftGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span>Giới hạn độ tuổi</span>
            <select
              value={draftFilters.ageRating}
              onChange={(event) => updateDraftFilter("ageRating", event.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="P">P - Mọi độ tuổi</option>
              <option value="K">K - Dưới 13 tuổi có giám hộ</option>
              <option value="C13">C13 - Từ 13 tuổi</option>
              <option value="C16">C16 - Từ 16 tuổi</option>
              <option value="C18">C18 - Từ 18 tuổi</option>
            </select>
          </label>

          <div className="filter-actions">
            <button type="button" className="secondary" onClick={resetMovieFilters}>
              Xóa lọc
            </button>
            <button type="submit" className="primary">
              Chấp nhận
            </button>
          </div>
        </form>
      </aside>
    </div>
  );

  /*
  const renderTrailerModal = () => {
    if (!trailerMovie) return null;

    const trailerEmbedUrl = getTrailerEmbedUrl(trailerMovie);

    return (
      <div className="client-trailer-overlay" onMouseDown={() => setTrailerMovie(null)}>
        <div className="client-trailer-modal" onMouseDown={(event) => event.stopPropagation()}>
          <div className="trailer-modal-head">
            <div>
              <span>Trailer</span>
              <h2>{trailerMovie.title}</h2>
            </div>
            <button type="button" onClick={() => setTrailerMovie(null)} aria-label="Đóng trailer">
              ×
            </button>
          </div>

          {trailerEmbedUrl ? (
            <iframe
              src={trailerEmbedUrl}
              title={`Trailer ${trailerMovie.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="trailer-empty">Phim này chưa có trailer.</div>
          )}
        </div>
      </div>
    );
  };

  */
  return (
    <div className="client-home">
      <header className="client-header">
        <div className="client-nav-wrap">
          <Link to="/" className="client-brand" onClick={() => setView("home")}>
            HMCinema
          </Link>

          <nav className="client-nav" aria-label="Điều hướng khách hàng">
            <button type="button" onClick={openFilterPanel}>
              TÌM KIẾM THEO BỘ LỌC
            </button>
            <a href="#schedule" onClick={() => setView("home")}>
              TÌM KIẾM THEO LỊCH CHIẾU
            </a>
            <a href="#news" onClick={() => setView("home")}>
              TIN TỨC/SỰ KIỆN
            </a>
            <a href="#support">LIÊN HỆ/HỖ TRỢ</a>
          </nav>

          <div className="client-actions">
            {auth ? (
              <>
                <button type="button" className="client-user-link" onClick={() => setView("account")}>
                  ▣ {auth.fullName || "Tài khoản"}
                </button>
                <button type="button" className="client-logout-link" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button type="button" className="client-login-link" onClick={() => openAuthModal("login")}>
                Đăng Nhập
              </button>
            )}
            <span>Ngôn ngữ:</span>
            <span className="flag-vn">🇻🇳</span>
          </div>
        </div>
      </header>

      {view === "account" && auth
        ? renderAccount()
        : view === "movieDetail"
          ? renderMovieDetail()
          : view === "booking"
            ? renderBooking()
            : renderHome()}
      {renderFilterPanel()}

      <ClientFooter />

      <ClientAuthModal
        authMode={authMode}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        authError={authError}
        authInfo={authInfo}
        authLoading={authLoading}
        closeAuthModal={closeAuthModal}
        openAuthModal={openAuthModal}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        setAuthInfo={setAuthInfo}
      />    </div>
  );
}

export default HomePage;
