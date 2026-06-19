package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.TicketPricing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketPricingRepository extends JpaRepository<TicketPricing, Long> {

    Optional<TicketPricing> findByDayGroupAndTimeSlot(String dayGroup, String timeSlot);
}