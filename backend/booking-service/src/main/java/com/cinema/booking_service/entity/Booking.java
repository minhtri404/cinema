package com.cinema.booking_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 40)
    private String bookingCode;

    private Long userId;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    private Long showtimeId;

    private String movieTitle;

    private String theaterName;

    private String roomName;

    private LocalDate showDate;

    private LocalTime startTime;

    private BigDecimal ticketAmount;

    private BigDecimal foodAmount;

    private BigDecimal discountAmount;

    @Column(length = 50)
    private String promotionCode;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime expiredAt;

    private LocalDateTime paidAt;

    private LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingSeat> seats = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingFood> foods = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Ticket ticket;
}
