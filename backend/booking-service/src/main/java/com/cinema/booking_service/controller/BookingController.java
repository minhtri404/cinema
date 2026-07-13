package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingFood;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.entity.Payment;
import com.cinema.booking_service.entity.Ticket;
import com.cinema.booking_service.repository.BookingRepository;
import com.cinema.booking_service.service.ProductServiceClient;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BookingController {

    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final BookingRepository bookingRepository;
    private final ProductServiceClient productServiceClient;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/tickets")
    public List<Booking> getTicketsForAdmin() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay booking"));
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @GetMapping("/product/{productId}")
    public Map<String, Object> getProductForOrder(@PathVariable Long productId) {
        return productServiceClient.getProductById(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@RequestBody Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        booking.setId(null);
        booking.setBookingCode("BK" + now.format(CODE_TIME));
        booking.setStatus("PENDING");
        booking.setCreatedAt(now);
        booking.setExpiredAt(now.plusMinutes(15));
        booking.setPaidAt(null);
        booking.setCancelledAt(null);
        booking.setTicket(null);
        booking.getPayments().clear();

        BigDecimal ticketAmount = BigDecimal.ZERO;
        if (booking.getSeats() != null) {
            for (BookingSeat seat : booking.getSeats()) {
                ticketAmount = ticketAmount.add(value(seat.getPrice()));
                seat.setBooking(booking);
            }
        }

        BigDecimal foodAmount = BigDecimal.ZERO;
        if (booking.getFoods() != null) {
            for (BookingFood food : booking.getFoods()) {
                BigDecimal quantity = BigDecimal.valueOf(food.getQuantity() == null ? 0 : food.getQuantity());
                BigDecimal totalPrice = value(food.getTotalPrice());
                if (totalPrice.compareTo(BigDecimal.ZERO) == 0) {
                    totalPrice = value(food.getUnitPrice()).multiply(quantity);
                    food.setTotalPrice(totalPrice);
                }
                foodAmount = foodAmount.add(totalPrice);
                food.setBooking(booking);
            }
        }

        booking.setTicketAmount(ticketAmount);
        booking.setFoodAmount(foodAmount);
        if (booking.getDiscountAmount() == null) {
            booking.setDiscountAmount(BigDecimal.ZERO);
        }
        booking.setTotalAmount(ticketAmount.add(foodAmount).subtract(value(booking.getDiscountAmount())));

        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/pay")
    public Booking pay(@PathVariable Long id, @RequestBody(required = false) PaymentRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay booking"));

        if ("CANCELLED".equals(booking.getStatus()) || "EXPIRED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking da bi huy hoac het han");
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setStatus("PAID");
        booking.setPaidAt(now);

        Payment payment = Payment.builder()
                .paymentMethod(request != null && request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .amount(booking.getTotalAmount())
                .status("SUCCESS")
                .transactionCode(request != null && request.getTransactionCode() != null
                        ? request.getTransactionCode()
                        : "PAY" + now.format(CODE_TIME))
                .createdAt(now)
                .paidAt(now)
                .booking(booking)
                .build();
        booking.getPayments().add(payment);

        if (booking.getTicket() == null) {
            Ticket ticket = Ticket.builder()
                    .ticketCode("TK" + now.format(CODE_TIME) + booking.getId())
                    .qrCode("QR-" + booking.getBookingCode())
                    .status("VALID")
                    .issuedAt(now)
                    .booking(booking)
                    .build();
            booking.setTicket(ticket);
        } else {
            booking.getTicket().setStatus("VALID");
            booking.getTicket().setIssuedAt(now);
        }

        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/confirm")
    public Booking confirm(@PathVariable Long id) {
        return pay(id, new PaymentRequest());
    }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay booking"));

        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        if (booking.getTicket() != null) {
            booking.getTicket().setStatus("CANCELLED");
        }
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/expire")
    public Booking expire(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay booking"));

        if (!"PAID".equals(booking.getStatus())) {
            booking.setStatus("EXPIRED");
        }
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/use-ticket")
    public Booking useTicket(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay booking"));

        if (booking.getTicket() == null || !"VALID".equals(booking.getTicket().getStatus())) {
            throw new RuntimeException("Ve khong hop le hoac da su dung");
        }

        booking.getTicket().setStatus("USED");
        booking.getTicket().setUsedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        bookingRepository.deleteById(id);
        return "Da xoa booking";
    }

    private BigDecimal value(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    @Getter
    @Setter
    public static class PaymentRequest {
        private String paymentMethod;
        private String transactionCode;
    }
}
