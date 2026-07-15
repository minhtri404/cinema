package com.cinema.movie_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String genre;

    private String ageRating;

    private Integer duration;

    private String director;

    private LocalDate releaseDate;

    private String posterUrl;

    private String trailerUrl;

    private String status;

    private LocalDateTime createdAt;
}
