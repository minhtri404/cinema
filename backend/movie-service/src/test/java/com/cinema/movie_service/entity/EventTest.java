package com.cinema.movie_service.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class EventTest {

    @Test
    void returnsExpiredWhenEndDateHasPassed() {
        Event event = Event.builder()
                .status("ONLINE")
                .endDate(LocalDate.now().minusDays(1))
                .build();

        assertThat(event.getEffectiveStatus()).isEqualTo("EXPIRED");
    }

    @Test
    void keepsChannelWhileEventIsStillValid() {
        Event event = Event.builder()
                .status("OFFLINE")
                .endDate(LocalDate.now())
                .build();

        assertThat(event.getEffectiveStatus()).isEqualTo("OFFLINE");
    }
}
