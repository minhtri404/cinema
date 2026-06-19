package com.cinema.showtime_service.repository;

import com.cinema.showtime_service.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomIdOrderBySeatRowAscSeatNumberAsc(Long roomId);

    void deleteByRoomId(Long roomId);
}
