package com.cinema.showtime_service.repository;

import com.cinema.showtime_service.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("""
            SELECT s FROM Showtime s
            WHERE (:theaterId IS NULL OR s.theaterId = :theaterId)
              AND (:showDate IS NULL OR s.showDate = :showDate)
            ORDER BY s.showDate DESC, s.startTime ASC
            """)
    List<Showtime> findByFilters(
            @Param("theaterId") Long theaterId,
            @Param("showDate") LocalDate showDate
    );

    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
            FROM Showtime s
            WHERE s.roomId = :roomId
              AND s.showDate = :showDate
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND (:excludeId IS NULL OR s.id <> :excludeId)
            """)
    boolean hasScheduleConflict(
            @Param("roomId") Long roomId,
            @Param("showDate") LocalDate showDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
