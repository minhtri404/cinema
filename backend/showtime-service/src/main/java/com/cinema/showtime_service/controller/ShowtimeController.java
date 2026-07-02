package com.cinema.showtime_service.controller;

import com.cinema.showtime_service.entity.Room;
import com.cinema.showtime_service.entity.Showtime;
import com.cinema.showtime_service.repository.RoomRepository;
import com.cinema.showtime_service.repository.ShowtimeRepository;
import com.cinema.showtime_service.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ShowtimeController {

    private final ShowtimeRepository showtimeRepository;
    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public List<Showtime> getAll(
            @RequestParam(required = false) Long theaterId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate
    ) {
        return showtimeRepository.findByFilters(theaterId, showDate);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getById(@PathVariable Long id) {
        return showtimeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Showtime request) {
        ResponseEntity<String> validationError = validate(request, null);
        if (validationError != null) {
            return validationError;
        }

        request.setId(null);
        applyDefaults(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(showtimeRepository.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Showtime request) {
        Showtime current = showtimeRepository.findById(id).orElse(null);
        if (current == null) {
            return ResponseEntity.notFound().build();
        }

        ResponseEntity<String> validationError = validate(request, id);
        if (validationError != null) {
            return validationError;
        }

        current.setTheaterId(request.getTheaterId());
        current.setRoomId(request.getRoomId());
        current.setMovieId(request.getMovieId());
        current.setMovieName(request.getMovieName().trim());
        current.setShowDate(request.getShowDate());
        current.setStartTime(request.getStartTime());
        current.setEndTime(request.getEndTime());
        current.setAudioLanguage(request.getAudioLanguage());
        current.setSubtitleLanguage(request.getSubtitleLanguage());
        current.setFormatType(request.getFormatType());
        current.setStatus(request.getStatus());
        applyDefaults(current);

        return ResponseEntity.ok(showtimeRepository.save(current));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!showtimeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        showtimeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(Showtime request, Long excludeId) {
        if (request.getTheaterId() == null || !theaterRepository.existsById(request.getTheaterId())) {
            return ResponseEntity.badRequest().body("Rạp chiếu không hợp lệ.");
        }

        if (request.getRoomId() == null) {
            return ResponseEntity.badRequest().body("Phòng chiếu không được để trống.");
        }

        Room room = roomRepository.findById(request.getRoomId()).orElse(null);
        if (room == null || !request.getTheaterId().equals(room.getTheaterId())) {
            return ResponseEntity.badRequest().body("Phòng chiếu không thuộc rạp đã chọn.");
        }

        if (request.getMovieId() == null
                || request.getMovieName() == null
                || request.getMovieName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Phim không được để trống.");
        }

        if (request.getShowDate() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            return ResponseEntity.badRequest().body("Ngày và giờ chiếu không được để trống.");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            return ResponseEntity.badRequest().body("Giờ kết thúc phải sau giờ bắt đầu.");
        }

        if (showtimeRepository.hasScheduleConflict(
                request.getRoomId(),
                request.getShowDate(),
                request.getStartTime(),
                request.getEndTime(),
                excludeId
        )) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Phòng chiếu đã có lịch trùng trong khung giờ này.");
        }

        return null;
    }

    private void applyDefaults(Showtime showtime) {
        showtime.setMovieName(showtime.getMovieName().trim());
        showtime.setAudioLanguage(defaultText(showtime.getAudioLanguage(), "Việt"));
        showtime.setSubtitleLanguage(trimToNull(showtime.getSubtitleLanguage()));
        showtime.setFormatType(defaultText(showtime.getFormatType(), "2D"));
        showtime.setStatus(defaultText(showtime.getStatus(), "ONLINE"));
    }

    private String defaultText(String value, String defaultValue) {
        String normalized = trimToNull(value);
        return normalized == null ? defaultValue : normalized;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
