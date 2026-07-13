package com.cinema.movie_service.controller;

import com.cinema.movie_service.entity.Advertisement;
import com.cinema.movie_service.repository.AdvertisementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/advertisements")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdvertisementController {

    private final AdvertisementRepository advertisementRepository;

    @GetMapping
    public List<Advertisement> getAll() {
        return advertisementRepository.findAllByOrderByDisplayOrderAscIdDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Advertisement> getById(@PathVariable Long id) {
        return advertisementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Advertisement advertisement) {
        ResponseEntity<String> error = validate(advertisement, null);
        if (error != null) return error;

        advertisement.setId(null);
        normalize(advertisement);
        return ResponseEntity.status(HttpStatus.CREATED).body(advertisementRepository.save(advertisement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Advertisement request) {
        Advertisement advertisement = advertisementRepository.findById(id).orElse(null);
        if (advertisement == null) return ResponseEntity.notFound().build();

        ResponseEntity<String> error = validate(request, id);
        if (error != null) return error;

        advertisement.setTitle(request.getTitle());
        advertisement.setImageUrl(request.getImageUrl());
        advertisement.setTargetUrl(request.getTargetUrl());
        advertisement.setDescription(request.getDescription());
        advertisement.setPlacement(request.getPlacement());
        advertisement.setStartDate(request.getStartDate());
        advertisement.setEndDate(request.getEndDate());
        advertisement.setStatus(request.getStatus());
        advertisement.setDisplayOrder(request.getDisplayOrder());
        normalize(advertisement);

        return ResponseEntity.ok(advertisementRepository.save(advertisement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!advertisementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        advertisementRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(Advertisement advertisement, Long id) {
        if (advertisement.getTitle() == null || advertisement.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên quảng cáo không được để trống.");
        }
        if (advertisement.getImageUrl() == null || advertisement.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Ảnh quảng cáo không được để trống.");
        }
        if (advertisement.getStartDate() == null || advertisement.getEndDate() == null) {
            return ResponseEntity.badRequest().body("Thời gian quảng cáo không được để trống.");
        }
        if (advertisement.getEndDate().isBefore(advertisement.getStartDate())) {
            return ResponseEntity.badRequest().body("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
        }

        boolean duplicate = id == null
                ? advertisementRepository.existsByTitleIgnoreCase(advertisement.getTitle().trim())
                : advertisementRepository.existsByTitleIgnoreCaseAndIdNot(advertisement.getTitle().trim(), id);
        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Tên quảng cáo đã tồn tại.");
        }
        return null;
    }

    private void normalize(Advertisement advertisement) {
        advertisement.setTitle(advertisement.getTitle().trim());
        advertisement.setImageUrl(advertisement.getImageUrl().trim());
        advertisement.setTargetUrl(trimToNull(advertisement.getTargetUrl()));
        advertisement.setDescription(trimToNull(advertisement.getDescription()));
        advertisement.setPlacement(defaultText(advertisement.getPlacement(), "HOME_BANNER").toUpperCase());
        advertisement.setStatus(defaultText(advertisement.getStatus(), "ONLINE").toUpperCase());
        advertisement.setDisplayOrder(advertisement.getDisplayOrder() == null ? 0 : Math.max(0, advertisement.getDisplayOrder()));
        if (advertisement.getStartDate() == null) {
            advertisement.setStartDate(LocalDate.now());
        }
        if (advertisement.getEndDate() == null) {
            advertisement.setEndDate(LocalDate.now().plusDays(30));
        }
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
