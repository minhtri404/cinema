package com.cinema.media_service.entity;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

public enum MediaCategory {
    MOVIES,
    EVENTS,
    NEWS,
    PROMOTIONS,
    ADVERTISEMENTS,
    FOODS,
    COMBOS,
    GENERAL;

    public static MediaCategory from(String value) {
        if (value == null || value.isBlank()) return GENERAL;
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nhóm ảnh chỉ gồm: movies, events, news, promotions, advertisements, foods, combos hoặc general"
            );
        }
    }
}
