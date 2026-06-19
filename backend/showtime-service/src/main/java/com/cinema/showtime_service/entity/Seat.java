package com.cinema.showtime_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;

    @Column(nullable = false, length = 20)
    private String seatCode;

    @Column(length = 10)
    private String seatRow;

    private Integer seatNumber;

    @Column(length = 30)
    private String seatType;

    private Double extraPrice;

    @Column(length = 30)
    private String status;
}