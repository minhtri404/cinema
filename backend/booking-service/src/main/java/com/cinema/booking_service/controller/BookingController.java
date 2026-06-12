package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BookingController {

    private final BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUserId(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking) {
        BigDecimal total = BigDecimal.ZERO;

        for (BookingSeat seat : booking.getSeats()) {
            total = total.add(seat.getPrice());
            seat.setBooking(booking);
        }

        booking.setTotalAmount(total);
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/confirm")
    public Booking confirm(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé đặt"));

        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        bookingRepository.deleteById(id);
        return "Đã xóa vé đặt";
    }
}