package com.cinema.booking_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_surcharges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSurcharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String surchargeKey;

    @Column(nullable = false, length = 100)
    private String surchargeName;

    private Double amount;
}
