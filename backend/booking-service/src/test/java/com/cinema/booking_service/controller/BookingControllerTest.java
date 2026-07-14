package com.cinema.booking_service.controller;

import com.cinema.booking_service.client.UserClient;
import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.repository.BookingRepository;
import com.cinema.booking_service.repository.BookingSeatRepository;
import com.cinema.booking_service.security.CurrentUser;
import com.cinema.booking_service.security.CurrentUserFilter;
import com.cinema.booking_service.service.BookingNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private BookingNotificationService notificationService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void rejectsBookingWhenSeatIsAlreadyBookedForShowtime() {
        BookingSeat requestedSeat = BookingSeat.builder()
                .seatId(25L)
                .seatCode("C5")
                .price(new BigDecimal("90000"))
                .build();
        Booking booking = Booking.builder()
                .userId(2L)
                .showtimeId(10L)
                .seats(List.of(requestedSeat))
                .build();
        BookingSeat bookedSeat = BookingSeat.builder()
                .seatId(25L)
                .seatCode("C5")
                .price(new BigDecimal("90000"))
                .build();

        when(request.getAttribute(CurrentUserFilter.CURRENT_USER_ATTRIBUTE))
                .thenReturn(new CurrentUser(2L, "user@cinema.vn", "USER"));
        when(bookingSeatRepository.findBookedByShowtimeId(10L))
                .thenReturn(List.of(bookedSeat));

        assertThatThrownBy(() -> bookingController.create(booking, request))
                .isInstanceOfSatisfying(ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(bookingRepository, never()).save(booking);
    }

    @Test
    void staffCanViewAllOnlineBookings() {
        Booking booking = Booking.builder().id(8L).userId(2L).status("PAID").build();
        when(request.getAttribute(CurrentUserFilter.CURRENT_USER_ATTRIBUTE))
                .thenReturn(new CurrentUser(4L, "staff@cinema.vn", "STAFF"));
        when(bookingRepository.findAll()).thenReturn(List.of(booking));

        List<Booking> result = bookingController.getAll(request);

        assertThat(result).containsExactly(booking);
        verify(bookingRepository).findAll();
    }
}
