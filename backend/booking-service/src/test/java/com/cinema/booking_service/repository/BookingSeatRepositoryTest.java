package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingSeat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class BookingSeatRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Test
    void bookedSeatIsReleasedAfterBookingIsCancelled() {
        Booking booking = Booking.builder()
                .userId(2L)
                .showtimeId(10L)
                .totalAmount(new BigDecimal("90000"))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .seats(new ArrayList<>())
                .build();
        BookingSeat seat = BookingSeat.builder()
                .seatId(25L)
                .seatCode("C5")
                .price(new BigDecimal("90000"))
                .booking(booking)
                .build();
        booking.getSeats().add(seat);
        booking = bookingRepository.saveAndFlush(booking);

        List<BookingSeat> bookedSeats = bookingSeatRepository.findBookedByShowtimeId(10L);
        assertThat(bookedSeats).extracting(BookingSeat::getSeatId).containsExactly(25L);

        booking.setStatus("CANCELLED");
        bookingRepository.saveAndFlush(booking);

        assertThat(bookingSeatRepository.findBookedByShowtimeId(10L)).isEmpty();
    }
}
