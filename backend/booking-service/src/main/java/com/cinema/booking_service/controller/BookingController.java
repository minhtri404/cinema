package com.cinema.booking_service.controller;

import com.cinema.booking_service.client.UserClient;
import com.cinema.booking_service.dto.BookedSeatDetail;
import com.cinema.booking_service.dto.SeatLockInfo;
import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingFood;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.entity.Payment;
import com.cinema.booking_service.entity.Promotion;
import com.cinema.booking_service.entity.Ticket;
import com.cinema.booking_service.repository.BookingRepository;
import com.cinema.booking_service.repository.BookingSeatRepository;
import com.cinema.booking_service.repository.PromotionRepository;
import com.cinema.booking_service.security.CurrentUser;
import com.cinema.booking_service.security.CurrentUserFilter;
import com.cinema.booking_service.service.BookingNotificationService;
import com.cinema.booking_service.service.ProductServiceClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BookingController {

    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final PromotionRepository promotionRepository;
    private final UserClient userClient;
    private final BookingNotificationService notificationService;
    private final ProductServiceClient productServiceClient;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.booking.seat-hold-ttl-seconds:600}")
    private long seatHoldTtlSeconds;

    @GetMapping
    public List<Booking> getAll(HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/tickets")
    public List<Booking> getTicketsForAdmin(HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
        requireOwnerOrAdmin(booking, currentUser(request));
        return booking;
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable Long userId, HttpServletRequest request) {
        CurrentUser currentUser = currentUser(request);
        if (!currentUser.isAdmin() && !currentUser.owns(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chi chu tai khoan moi duoc xem don hang");
        }
        return bookingRepository.findByUserId(userId);
    }

    @GetMapping("/product/{productId}")
    public Map<String, Object> getProductForOrder(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {
        currentUser(request);
        return productServiceClient.getProductById(productId);
    }

    @GetMapping("/showtime/{showtimeId}/booked-seats")
    public List<BookingSeat> getBookedSeats(
            @PathVariable Long showtimeId,
            HttpServletRequest request
    ) {
        List<BookingSeat> result = new ArrayList<>(bookingSeatRepository.findBookedByShowtimeId(showtimeId));
        Set<Long> existingSeatIds = new HashSet<>();
        for (BookingSeat seat : result) {
            existingSeatIds.add(seat.getSeatId());
        }
        for (RedisSeatHold hold : findRedisSeatHolds(showtimeId)) {
            if (existingSeatIds.add(hold.getSeatId())) {
                result.add(BookingSeat.builder()
                        .seatId(hold.getSeatId())
                        .seatCode(hold.getSeatCode())
                        .price(hold.getPrice())
                        .build());
            }
        }
        return result;
    }

    @GetMapping("/showtime/{showtimeId}/seat-locks")
    public List<SeatLockInfo> getSeatLocks(
            @PathVariable Long showtimeId,
            HttpServletRequest request
    ) {
        CurrentUser currentUser = currentUser(request);
        Map<Long, SeatLockInfo> locks = new LinkedHashMap<>();

        bookingSeatRepository.findBookedByShowtimeId(showtimeId)
                .forEach(seat -> {
                    Booking booking = seat.getBooking();
                    String status = booking == null ? null : booking.getStatus();
                    boolean ownHold = booking != null
                            && currentUser.owns(booking.getUserId())
                            && "HOLD".equalsIgnoreCase(status);
                    locks.put(seat.getSeatId(), new SeatLockInfo(
                            seat.getSeatId(),
                            seat.getSeatCode(),
                            seat.getPrice(),
                            booking == null ? null : booking.getId(),
                            status,
                            ownHold
                    ));
                });

        findRedisSeatHolds(showtimeId).forEach(hold -> locks.putIfAbsent(
                hold.getSeatId(),
                new SeatLockInfo(
                        hold.getSeatId(),
                        hold.getSeatCode(),
                        hold.getPrice(),
                        null,
                        "HOLD",
                        currentUser.owns(hold.getUserId())
                )
        ));

        return new ArrayList<>(locks.values());
    }

    @GetMapping("/showtime/{showtimeId}/booked-seat-details")
    public List<BookedSeatDetail> getBookedSeatDetails(
            @PathVariable Long showtimeId,
            HttpServletRequest request
    ) {
        requireStaffOrAdmin(currentUser(request));
        Map<Long, UserClient.UserSummary> users = new HashMap<>();

        return bookingSeatRepository.findBookedByShowtimeId(showtimeId)
                .stream()
                .map(seat -> {
                    Booking booking = seat.getBooking();
                    Long userId = booking.getUserId();
                    UserClient.UserSummary user = users.computeIfAbsent(
                            userId,
                            this::getUserSafely
                    );
                    String customerName = user == null
                            ? "Khách hàng #" + userId
                            : user.fullName();

                    return new BookedSeatDetail(
                            seat.getSeatId(),
                            seat.getSeatCode(),
                            seat.getPrice(),
                            booking.getId(),
                            booking.getStatus(),
                            userId,
                            customerName,
                            user == null ? null : user.email()
                    );
                })
                .toList();
    }

    @PostMapping("/holds")
    @Transactional
    public Map<String, Object> holdSeats(@RequestBody SeatHoldRequest holdRequest, HttpServletRequest request) {
        CurrentUser currentUser = currentUser(request);
        if (holdRequest == null || holdRequest.getShowtimeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Suat chieu khong duoc de trong");
        }

        List<BookingSeat> requestedSeats = holdRequest.getSeats() == null
                ? Collections.emptyList()
                : holdRequest.getSeats();

        if (requestedSeats.isEmpty()) {
            releaseRedisHolds(currentUser.id(), holdRequest.getShowtimeId());
            releaseActiveHolds(currentUser.id(), holdRequest.getShowtimeId());
            return Map.of(
                    "message", "Da bo giu ghe",
                    "expiresIn", 0,
                    "seats", Collections.emptyList()
            );
        }

        Set<Long> requestedSeatIds = new HashSet<>();
        for (BookingSeat seat : requestedSeats) {
            if (seat.getSeatId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ghe khong hop le");
            }
            if (!requestedSeatIds.add(seat.getSeatId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sach ghe bi trung");
            }
            if (seat.getPrice() == null || seat.getPrice().signum() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gia ghe khong hop le");
            }
        }

        boolean seatAlreadyHeld = bookingSeatRepository
                .findBookedByShowtimeId(holdRequest.getShowtimeId())
                .stream()
                .filter(bookingSeat -> bookingSeat.getBooking() == null
                        || !currentUser.owns(bookingSeat.getBooking().getUserId()))
                .map(BookingSeat::getSeatId)
                .anyMatch(requestedSeatIds::contains);
        if (seatAlreadyHeld) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mot hoac nhieu ghe dang duoc nguoi khac giu/dat");
        }

        List<String> acquiredKeys = new ArrayList<>();
        for (BookingSeat seat : requestedSeats) {
            holdSeatInRedis(holdRequest.getShowtimeId(), currentUser.id(), seat, acquiredKeys);
        }

        LocalDateTime now = LocalDateTime.now();
        BigDecimal ticketAmount = BigDecimal.ZERO;
        for (BookingSeat seat : requestedSeats) {
            ticketAmount = ticketAmount.add(seat.getPrice());
        }

        releaseRedisHoldsExcept(currentUser.id(), holdRequest.getShowtimeId(), requestedSeatIds);
        releaseActiveHolds(currentUser.id(), holdRequest.getShowtimeId());

        return Map.of(
                "message", "Da giu ghe trong 10 phut",
                "bookingCode", "HD" + now.format(CODE_TIME),
                "expiresAt", now.plusSeconds(seatHoldTtlSeconds),
                "expiresIn", seatHoldTtlSeconds,
                "ticketAmount", ticketAmount,
                "seats", requestedSeats
        );
    }

    @PostMapping
    @Transactional
    public Booking create(@RequestBody Booking booking, HttpServletRequest request) {
        CurrentUser currentUser = currentUser(request);
        if (booking.getUserId() == null || !currentUser.isAdmin()) {
            booking.setUserId(currentUser.id());
        }
        if (!currentUser.isAdmin() && !currentUser.owns(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khong duoc tao don hang cho nguoi dung khac");
        }

        Booking saved = createBooking(booking);
        notificationService.bookingCreated(saved);
        return saved;
    }

    private Booking createBooking(Booking booking) {
        userClient.getById(booking.getUserId());

        LocalDateTime now = LocalDateTime.now();
        booking.setId(null);
        booking.setBookingCode("BK" + now.format(CODE_TIME));
        booking.setExpiredAt(now.plusMinutes(10));
        booking.setPaidAt(null);
        booking.setCancelledAt(null);
        booking.setTicket(null);
        booking.getPayments().clear();

        if (booking.getShowtimeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Suất chiếu không được để trống");
        }

        List<BookingSeat> requestedSeats = safeSeats(booking);
        if (requestedSeats.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking phải có ít nhất một ghế");
        }

        Set<Long> requestedSeatIds = new HashSet<>();
        for (BookingSeat seat : requestedSeats) {
            if (seat.getSeatId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ghế không hợp lệ");
            }
            if (!requestedSeatIds.add(seat.getSeatId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách ghế bị trùng");
            }
            if (seat.getPrice() == null || seat.getPrice().signum() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá ghế không hợp lệ");
            }
        }

        boolean seatHeldByOtherUser = findRedisSeatHolds(booking.getShowtimeId())
                .stream()
                .filter(hold -> !booking.getUserId().equals(hold.getUserId()))
                .map(RedisSeatHold::getSeatId)
                .anyMatch(requestedSeatIds::contains);
        if (seatHeldByOtherUser) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mot hoac nhieu ghe dang duoc nguoi khac giu");
        }

        releaseActiveHolds(booking.getUserId(), booking.getShowtimeId());

        boolean seatAlreadyBooked = bookingSeatRepository
                .findBookedByShowtimeId(booking.getShowtimeId())
                .stream()
                .map(BookingSeat::getSeatId)
                .anyMatch(requestedSeatIds::contains);
        if (seatAlreadyBooked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Một hoặc nhiều ghế đã được đặt");
        }

        BigDecimal ticketAmount = BigDecimal.ZERO;

        for (BookingSeat seat : requestedSeats) {
            ticketAmount = ticketAmount.add(seat.getPrice());
            seat.setBooking(booking);
        }

        BigDecimal foodAmount = BigDecimal.ZERO;
        for (BookingFood food : booking.getFoods()) {
            BigDecimal quantity = BigDecimal.valueOf(food.getQuantity() == null ? 0 : food.getQuantity());
            BigDecimal totalPrice = value(food.getTotalPrice());
            if (totalPrice.signum() == 0) {
                totalPrice = value(food.getUnitPrice()).multiply(quantity);
                food.setTotalPrice(totalPrice);
            }
            foodAmount = foodAmount.add(totalPrice);
            food.setBooking(booking);
        }

        BigDecimal orderAmount = ticketAmount.add(foodAmount);
        BigDecimal discountAmount = applyPromotionToBooking(booking, orderAmount);
        booking.setTicketAmount(ticketAmount);
        booking.setFoodAmount(foodAmount);
        booking.setDiscountAmount(discountAmount);
        booking.setTotalAmount(orderAmount.subtract(discountAmount).max(BigDecimal.ZERO));
        booking.setStatus("PENDING");
        booking.setCreatedAt(now);

        Booking saved = bookingRepository.save(booking);
        releaseRedisHolds(booking.getUserId(), booking.getShowtimeId());
        return saved;
    }

    @PutMapping({"/{id}/pay", "/{id}/confirm"})
    public Booking markPaid(
            @PathVariable Long id,
            @RequestBody(required = false) PaymentRequest paymentRequest,
            HttpServletRequest request
    ) {
        requireStaffOrAdmin(currentUser(request));
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));

        if (isCancelled(booking)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking đã hủy không thể thanh toán");
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setStatus("PAID");
        booking.setPaidAt(now);

        Payment payment = Payment.builder()
                .paymentMethod(paymentRequest != null && paymentRequest.getPaymentMethod() != null
                        ? paymentRequest.getPaymentMethod() : "ONLINE")
                .amount(booking.getTotalAmount())
                .status("SUCCESS")
                .transactionCode(paymentRequest != null && paymentRequest.getTransactionCode() != null
                        ? paymentRequest.getTransactionCode() : "PAY" + now.format(CODE_TIME))
                .createdAt(now)
                .paidAt(now)
                .booking(booking)
                .build();
        booking.getPayments().add(payment);

        if (booking.getTicket() == null) {
            booking.setTicket(Ticket.builder()
                    .ticketCode("TK" + now.format(CODE_TIME) + booking.getId())
                    .qrCode("QR-" + booking.getBookingCode())
                    .status("VALID")
                    .issuedAt(now)
                    .booking(booking)
                    .build());
        } else {
            booking.getTicket().setStatus("VALID");
            booking.getTicket().setIssuedAt(now);
        }
        Booking saved = bookingRepository.save(booking);
        notificationService.bookingPaid(saved);
        return saved;
    }

    @PutMapping("/{id}/client-pay")
    @Transactional
    public Booking clientPay(
            @PathVariable Long id,
            @RequestBody(required = false) PaymentRequest paymentRequest,
            HttpServletRequest request
    ) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay ve dat"));
        requireOwnerOrStaffOrAdmin(booking, currentUser(request));

        if (isCancelled(booking)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking da huy khong the thanh toan");
        }
        if ("PAID".equalsIgnoreCase(booking.getStatus())) {
            return booking;
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setStatus("PAID");
        booking.setPaidAt(now);

        Payment payment = Payment.builder()
                .paymentMethod(paymentRequest != null && paymentRequest.getPaymentMethod() != null
                        ? paymentRequest.getPaymentMethod() : "VNPAY_DEMO")
                .amount(booking.getTotalAmount())
                .status("SUCCESS")
                .transactionCode(paymentRequest != null && paymentRequest.getTransactionCode() != null
                        ? paymentRequest.getTransactionCode() : "PAY" + now.format(CODE_TIME))
                .createdAt(now)
                .paidAt(now)
                .booking(booking)
                .build();
        booking.getPayments().add(payment);

        if (booking.getTicket() == null) {
            booking.setTicket(Ticket.builder()
                    .ticketCode("TK" + now.format(CODE_TIME) + booking.getId())
                    .qrCode("QR-" + booking.getBookingCode())
                    .status("VALID")
                    .issuedAt(now)
                    .booking(booking)
                    .build());
        } else {
            booking.getTicket().setStatus("VALID");
            booking.getTicket().setIssuedAt(now);
        }
        Booking saved = bookingRepository.save(booking);
        notificationService.bookingPaid(saved);
        return saved;
    }

    @PutMapping("/{id}/cancel")
    @Transactional
    public Booking cancel(@PathVariable Long id, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
        requireOwnerOrStaffOrAdmin(booking, currentUser(request));

        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        if (booking.getTicket() != null) booking.getTicket().setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);
        notificationService.bookingCancelled(saved);
        return saved;
    }

    @PutMapping("/{id}/expire")
    public Booking expire(@PathVariable Long id, HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
        if (!"PAID".equalsIgnoreCase(booking.getStatus())) booking.setStatus("EXPIRED");
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/use-ticket")
    public Booking useTicket(@PathVariable Long id, HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
        if (booking.getTicket() == null || !"VALID".equals(booking.getTicket().getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vé không hợp lệ hoặc đã được sử dụng");
        }
        booking.getTicket().setStatus("USED");
        booking.getTicket().setUsedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
        requireOwnerOrAdmin(booking, currentUser(request));
        bookingRepository.deleteById(id);
        return "Đã xóa vé đặt";
    }

    private CurrentUser currentUser(HttpServletRequest request) {
        Object currentUser = request.getAttribute(CurrentUserFilter.CURRENT_USER_ATTRIBUTE);
        if (currentUser instanceof CurrentUser user) {
            return user;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
    }

    private void requireAdmin(CurrentUser currentUser) {
        if (!currentUser.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can quyen ADMIN");
        }
    }

    private void requireOwnerOrAdmin(Booking booking, CurrentUser currentUser) {
        if (!currentUser.isAdmin() && !currentUser.owns(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chi chu don hang moi duoc thao tac");
        }
    }

    private List<BookingSeat> safeSeats(Booking booking) {
        if (booking.getSeats() == null) {
            return Collections.emptyList();
        }
        return booking.getSeats();
    }

    private void requireStaffOrAdmin(CurrentUser currentUser) {
        if (!currentUser.canManageBookings()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cần quyền STAFF hoặc ADMIN");
        }
    }

    private void requireOwnerOrStaffOrAdmin(Booking booking, CurrentUser currentUser) {
        if (!currentUser.canManageBookings() && !currentUser.owns(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền thao tác booking này");
        }
    }

    private boolean isCancelled(Booking booking) {
        String status = booking.getStatus();
        if (status == null) return false;
        String normalized = status.trim().toUpperCase();
        return normalized.equals("CANCELLED")
                || normalized.equals("CANCELED")
                || normalized.equals("ĐÃ_HỦY");
    }

    private BigDecimal value(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private BigDecimal applyPromotionToBooking(Booking booking, BigDecimal orderAmount) {
        String code = booking.getPromotionCode();
        if (code == null || code.isBlank()) {
            booking.setPromotionCode(null);
            return BigDecimal.ZERO;
        }

        Promotion promotion = promotionRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ma khuyen mai khong ton tai"));
        validatePromotionForOrder(promotion, orderAmount);

        BigDecimal discount = calculatePromotionDiscount(promotion, orderAmount);
        booking.setPromotionCode(promotion.getCode());
        promotion.setUsedCount((promotion.getUsedCount() == null ? 0 : promotion.getUsedCount()) + 1);
        promotionRepository.save(promotion);
        return discount;
    }

    private void validatePromotionForOrder(Promotion promotion, BigDecimal orderAmount) {
        LocalDate today = LocalDate.now();
        if (!"ONLINE".equalsIgnoreCase(promotion.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ma khuyen mai khong con hoat dong");
        }
        if (today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ma khuyen mai da het han hoac chua den ngay ap dung");
        }
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0
                && promotion.getUsedCount() != null
                && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ma khuyen mai da het luot su dung");
        }
        BigDecimal minOrderAmount = promotion.getMinOrderAmount() == null ? BigDecimal.ZERO : promotion.getMinOrderAmount();
        if (orderAmount.compareTo(minOrderAmount) < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Don hang chua dat gia tri toi thieu cua ma khuyen mai");
        }
    }

    private BigDecimal calculatePromotionDiscount(Promotion promotion, BigDecimal orderAmount) {
        BigDecimal discount;
        if ("FIXED".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = promotion.getDiscountValue();
        } else {
            discount = orderAmount
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        }
        if (promotion.getMaxDiscountAmount() != null && promotion.getMaxDiscountAmount().signum() > 0) {
            discount = discount.min(promotion.getMaxDiscountAmount());
        }
        return discount.min(orderAmount).max(BigDecimal.ZERO);
    }

    private void releaseActiveHolds(Long userId, Long showtimeId) {
        if (userId == null || showtimeId == null) {
            return;
        }

        List<Booking> holds = bookingRepository.findActiveHoldsByUserAndShowtime(userId, showtimeId);
        if (holds.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Booking hold : holds) {
            hold.setStatus("CANCELLED");
            hold.setCancelledAt(now);
        }
        bookingRepository.saveAll(holds);
    }

    private void holdSeatInRedis(
            Long showtimeId,
            Long userId,
            BookingSeat seat,
            List<String> acquiredKeys
    ) {
        String key = redisSeatHoldKey(showtimeId, seat.getSeatId());
        RedisSeatHold existingHold = readRedisSeatHold(key);
        RedisSeatHold hold = RedisSeatHold.from(showtimeId, userId, seat, seatHoldTtlSeconds);

        if (existingHold != null) {
            if (!userId.equals(existingHold.getUserId())) {
                if (!acquiredKeys.isEmpty()) {
                    redisTemplate.delete(acquiredKeys);
                }
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mot hoac nhieu ghe dang duoc nguoi khac giu/dat");
            }
            redisTemplate.opsForValue().set(key, writeRedisSeatHold(hold), Duration.ofSeconds(seatHoldTtlSeconds));
            return;
        }

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(key, writeRedisSeatHold(hold), Duration.ofSeconds(seatHoldTtlSeconds));
        if (!Boolean.TRUE.equals(acquired)) {
            RedisSeatHold lateHold = readRedisSeatHold(key);
            if (lateHold == null || !userId.equals(lateHold.getUserId())) {
                if (!acquiredKeys.isEmpty()) {
                    redisTemplate.delete(acquiredKeys);
                }
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mot hoac nhieu ghe dang duoc nguoi khac giu/dat");
            }
            redisTemplate.opsForValue().set(key, writeRedisSeatHold(hold), Duration.ofSeconds(seatHoldTtlSeconds));
            return;
        }

        acquiredKeys.add(key);
    }

    private List<RedisSeatHold> findRedisSeatHolds(Long showtimeId) {
        Set<String> keys = redisTemplate.keys(redisSeatHoldPattern(showtimeId));
        if (keys == null || keys.isEmpty()) {
            return Collections.emptyList();
        }

        List<RedisSeatHold> holds = new ArrayList<>();
        for (String key : keys) {
            RedisSeatHold hold = readRedisSeatHold(key);
            if (hold != null) {
                holds.add(hold);
            }
        }
        return holds;
    }

    private void releaseRedisHolds(Long userId, Long showtimeId) {
        releaseRedisHoldsExcept(userId, showtimeId, Collections.emptySet());
    }

    private void releaseRedisHoldsExcept(Long userId, Long showtimeId, Set<Long> keptSeatIds) {
        if (userId == null || showtimeId == null) {
            return;
        }

        Set<String> keys = redisTemplate.keys(redisSeatHoldPattern(showtimeId));
        if (keys == null || keys.isEmpty()) {
            return;
        }

        List<String> deleteKeys = new ArrayList<>();
        for (String key : keys) {
            RedisSeatHold hold = readRedisSeatHold(key);
            if (hold != null && userId.equals(hold.getUserId()) && !keptSeatIds.contains(hold.getSeatId())) {
                deleteKeys.add(key);
            }
        }
        if (!deleteKeys.isEmpty()) {
            redisTemplate.delete(deleteKeys);
        }
    }

    private RedisSeatHold readRedisSeatHold(String key) {
        String value = redisTemplate.opsForValue().get(key);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(value, RedisSeatHold.class);
        } catch (JsonProcessingException ignored) {
            redisTemplate.delete(key);
            return null;
        }
    }

    private String writeRedisSeatHold(RedisSeatHold hold) {
        try {
            return objectMapper.writeValueAsString(hold);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the giu ghe tam thoi");
        }
    }

    private String redisSeatHoldKey(Long showtimeId, Long seatId) {
        return "cinema:booking:seat-hold:" + showtimeId + ":" + seatId;
    }

    private String redisSeatHoldPattern(Long showtimeId) {
        return "cinema:booking:seat-hold:" + showtimeId + ":*";
    }

    private UserClient.UserSummary getUserSafely(Long userId) {
        if (userId == null) return null;
        try {
            return userClient.getById(userId);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    @Getter
    @Setter
    public static class PaymentRequest {
        private String paymentMethod;
        private String transactionCode;
    }

    @Getter
    @Setter
    public static class SeatHoldRequest {
        private Long showtimeId;
        private String movieTitle;
        private String theaterName;
        private String roomName;
        private java.time.LocalDate showDate;
        private java.time.LocalTime startTime;
        private List<BookingSeat> seats;
    }

    @Getter
    @Setter
    public static class RedisSeatHold {
        private Long showtimeId;
        private Long userId;
        private Long seatId;
        private String seatCode;
        private BigDecimal price;
        private LocalDateTime expiresAt;

        public static RedisSeatHold from(Long showtimeId, Long userId, BookingSeat seat, long ttlSeconds) {
            RedisSeatHold hold = new RedisSeatHold();
            hold.setShowtimeId(showtimeId);
            hold.setUserId(userId);
            hold.setSeatId(seat.getSeatId());
            hold.setSeatCode(seat.getSeatCode());
            hold.setPrice(seat.getPrice());
            hold.setExpiresAt(LocalDateTime.now().plusSeconds(ttlSeconds));
            return hold;
        }
    }
}
