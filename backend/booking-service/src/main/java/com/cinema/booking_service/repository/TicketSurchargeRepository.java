package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.TicketSurcharge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketSurchargeRepository extends JpaRepository<TicketSurcharge, Long> {

    Optional<TicketSurcharge> findBySurchargeKey(String surchargeKey);
}