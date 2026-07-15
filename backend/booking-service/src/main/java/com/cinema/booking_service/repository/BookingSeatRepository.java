package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    Set<String> CANCELLED_STATUSES = Set.of("CANCELLED", "CANCELED", "ĐÃ_HỦY");

    @Query("""
            SELECT bookingSeat
            FROM BookingSeat bookingSeat
            JOIN FETCH bookingSeat.booking booking
            WHERE booking.showtimeId = :showtimeId
              AND (
                booking.status IS NULL
                OR UPPER(booking.status) NOT IN :cancelledStatuses
              )
              AND (
                booking.expiredAt IS NULL
                OR booking.expiredAt > CURRENT_TIMESTAMP
                OR UPPER(booking.status) = 'PAID'
              )
            """)
    List<BookingSeat> findBookedByShowtimeId(
            @Param("showtimeId") Long showtimeId,
            @Param("cancelledStatuses") Set<String> cancelledStatuses
    );

    default List<BookingSeat> findBookedByShowtimeId(Long showtimeId) {
        return findBookedByShowtimeId(showtimeId, CANCELLED_STATUSES);
    }
}
