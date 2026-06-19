package com.cinema.showtime_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long theaterId;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer seatCount;

    private Integer rowCount;

    private Integer columnCount;

    @Column(length = 30)
    private String type;

    @Column(length = 30)
    private String status;
}