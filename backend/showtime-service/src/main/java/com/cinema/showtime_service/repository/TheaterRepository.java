package com.cinema.showtime_service.repository;

import com.cinema.showtime_service.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheaterRepository extends JpaRepository<Theater, Long> {
}
