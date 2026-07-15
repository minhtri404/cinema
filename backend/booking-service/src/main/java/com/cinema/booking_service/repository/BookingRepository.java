package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT booking
            FROM Booking booking
            WHERE booking.userId = :userId
              AND booking.showtimeId = :showtimeId
              AND UPPER(booking.status) = 'HOLD'
              AND booking.expiredAt > CURRENT_TIMESTAMP
            """)
    List<Booking> findActiveHoldsByUserAndShowtime(
            @Param("userId") Long userId,
            @Param("showtimeId") Long showtimeId
    );
}
