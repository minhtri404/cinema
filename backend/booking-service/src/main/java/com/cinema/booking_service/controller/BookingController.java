package com.cinema.booking_service.controller;

import com.cinema.booking_service.client.UserClient;
import com.cinema.booking_service.dto.BookedSeatDetail;
import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.repository.BookingRepository;
import com.cinema.booking_service.repository.BookingSeatRepository;
import com.cinema.booking_service.security.CurrentUser;
import com.cinema.booking_service.security.CurrentUserFilter;
import com.cinema.booking_service.service.BookingNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserClient userClient;
    private final BookingNotificationService notificationService;

    @GetMapping
    public List<Booking> getAll(HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        return bookingRepository.findAll();
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

        BigDecimal total = BigDecimal.ZERO;

        for (BookingSeat seat : requestedSeats) {
            total = total.add(seat.getPrice());
            seat.setBooking(booking);
        }

        booking.setTotalAmount(total);
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    @PutMapping({"/{id}/pay", "/{id}/confirm"})
    public Booking markPaid(@PathVariable Long id, HttpServletRequest request) {
        requireStaffOrAdmin(currentUser(request));
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));

        if (isCancelled(booking)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking đã hủy không thể thanh toán");
        }

        booking.setStatus("PAID");
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
        Booking saved = bookingRepository.save(booking);
        notificationService.bookingCancelled(saved);
        return saved;
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

    private UserClient.UserSummary getUserSafely(Long userId) {
        if (userId == null) return null;
        try {
            return userClient.getById(userId);
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
