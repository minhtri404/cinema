package com.cinema.showtime_service.repository;

import com.cinema.showtime_service.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
}