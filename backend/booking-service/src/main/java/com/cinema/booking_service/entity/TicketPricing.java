package com.cinema.booking_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MON_THU hoặc FRI_SUN
    @Column(nullable = false, length = 50)
    private String dayGroup;

    // BEFORE_17H hoặc AFTER_17H
    @Column(nullable = false, length = 50)
    private String timeSlot;

    private Double studentPrice;

    private Double adultPrice;

    private Double childSeniorPrice;

    private Double memberOnlinePrice;
}