package com.cinema.booking_service.controller;

import com.cinema.booking_service.client.UserClient;
import com.cinema.booking_service.dto.BookedSeatDetail;
import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingFood;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.entity.Payment;
import com.cinema.booking_service.entity.Ticket;
import com.cinema.booking_service.repository.BookingRepository;
import com.cinema.booking_service.repository.BookingSeatRepository;
import com.cinema.booking_service.security.CurrentUser;
import com.cinema.booking_service.security.CurrentUserFilter;
import com.cinema.booking_service.service.BookingNotificationService;
import com.cinema.booking_service.service.ProductServiceClient;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashSet;
import java.util.HashMap;
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
    private final UserClient userClient;
    private final BookingNotificationService notificationService;
    private final ProductServiceClient productServiceClient;

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
        currentUser(request);
        return bookingSeatRepository.findBookedByShowtimeId(showtimeId);
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
        booking.setExpiredAt(now.plusMinutes(15));
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

        BigDecimal discountAmount = value(booking.getDiscountAmount());
        booking.setTicketAmount(ticketAmount);
        booking.setFoodAmount(foodAmount);
        booking.setDiscountAmount(discountAmount);
        booking.setTotalAmount(ticketAmount.add(foodAmount).subtract(discountAmount));
        booking.setStatus("PENDING");
        booking.setCreatedAt(now);

        return bookingRepository.save(booking);
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
}
