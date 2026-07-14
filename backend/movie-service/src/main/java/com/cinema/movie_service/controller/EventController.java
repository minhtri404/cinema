package com.cinema.movie_service.controller;

import com.cinema.movie_service.entity.Event;
import com.cinema.movie_service.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EventController {

    private static final Set<String> EVENT_CHANNELS = Set.of("ONLINE", "OFFLINE");

    private final EventRepository eventRepository;

    @GetMapping
    public List<Event> getAll() {
        return eventRepository.findAllByOrderByStartDateDescIdDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Event event) {
        ResponseEntity<String> error = validate(event, null);
        if (error != null) return error;

        event.setId(null);
        normalize(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventRepository.save(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Event request) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) return ResponseEntity.notFound().build();

        ResponseEntity<String> error = validate(request, id);
        if (error != null) return error;

        event.setTitle(request.getTitle());
        event.setImageUrl(request.getImageUrl());
        event.setContent(request.getContent());
        event.setApplyCondition(request.getApplyCondition());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setStatus(request.getStatus());
        event.setStaffName(request.getStaffName());
        normalize(event);

        return ResponseEntity.ok(eventRepository.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(Event event, Long id) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tiêu đề sự kiện không được để trống.");
        }
        if (event.getStartDate() == null || event.getEndDate() == null) {
            return ResponseEntity.badRequest().body("Thời gian sự kiện không được để trống.");
        }
        if (event.getEndDate().isBefore(event.getStartDate())) {
            return ResponseEntity.badRequest().body("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
        }

        String status = defaultText(event.getStatus(), "ONLINE").toUpperCase();
        if (!EVENT_CHANNELS.contains(status)) {
            return ResponseEntity.badRequest()
                    .body("Trạng thái sự kiện chỉ được là ONLINE hoặc OFFLINE.");
        }

        boolean duplicate = id == null
                ? eventRepository.existsByTitleIgnoreCase(event.getTitle().trim())
                : eventRepository.existsByTitleIgnoreCaseAndIdNot(event.getTitle().trim(), id);
        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Tiêu đề sự kiện đã tồn tại.");
        }
        return null;
    }

    private void normalize(Event event) {
        event.setTitle(event.getTitle().trim());
        event.setImageUrl(trimToNull(event.getImageUrl()));
        event.setContent(trimToNull(event.getContent()));
        event.setApplyCondition(trimToNull(event.getApplyCondition()));
        event.setStatus(defaultText(event.getStatus(), "ONLINE").toUpperCase());
        event.setStaffName(defaultText(event.getStaffName(), "Admin Cinema"));
    }

    private String defaultText(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized == null ? fallback : normalized;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
