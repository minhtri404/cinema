package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.Promotion;
import com.cinema.booking_service.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PromotionController {

    private static final Set<String> DISCOUNT_TYPES = Set.of("PERCENT", "FIXED");
    private static final Set<String> STATUSES = Set.of("ONLINE", "OFFLINE", "EXPIRED");

    private final PromotionRepository promotionRepository;

    @GetMapping
    public List<Promotion> getAll() {
        return promotionRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getById(@PathVariable Long id) {
        return promotionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Promotion promotion) {
        normalize(promotion);
        ResponseEntity<String> error = validate(promotion, null);
        if (error != null) return error;

        promotion.setId(null);
        promotion.setUsedCount(0);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(promotionRepository.save(promotion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Promotion request) {
        Promotion promotion = promotionRepository.findById(id).orElse(null);
        if (promotion == null) return ResponseEntity.notFound().build();

        normalize(request);
        ResponseEntity<String> error = validate(request, id);
        if (error != null) return error;

        promotion.setCode(request.getCode());
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setImageUrl(request.getImageUrl());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStatus(request.getStatus());

        return ResponseEntity.ok(promotionRepository.save(promotion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!promotionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        promotionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(Promotion promotion, Long id) {
        if (promotion.getCode() == null || !promotion.getCode().matches("[A-Z0-9_-]{3,50}")) {
            return ResponseEntity.badRequest()
                    .body("Mã khuyến mãi phải có 3-50 ký tự, chỉ gồm chữ, số, gạch ngang hoặc gạch dưới.");
        }
        if (promotion.getName() == null || promotion.getName().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên khuyến mãi không được để trống.");
        }

        boolean duplicate = id == null
                ? promotionRepository.existsByCodeIgnoreCase(promotion.getCode())
                : promotionRepository.existsByCodeIgnoreCaseAndIdNot(promotion.getCode(), id);
        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Mã khuyến mãi đã tồn tại.");
        }
        if (!DISCOUNT_TYPES.contains(promotion.getDiscountType())) {
            return ResponseEntity.badRequest().body("Loại giảm giá không hợp lệ.");
        }
        if (promotion.getDiscountValue() == null
                || promotion.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Giá trị giảm phải lớn hơn 0.");
        }
        if ("PERCENT".equals(promotion.getDiscountType())
                && promotion.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            return ResponseEntity.badRequest().body("Phần trăm giảm không được vượt quá 100.");
        }
        if (promotion.getStartDate() == null || promotion.getEndDate() == null
                || promotion.getEndDate().isBefore(promotion.getStartDate())) {
            return ResponseEntity.badRequest().body("Thời gian áp dụng không hợp lệ.");
        }
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() < 0) {
            return ResponseEntity.badRequest().body("Giới hạn sử dụng không được là số âm.");
        }
        if (!STATUSES.contains(promotion.getStatus())) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ.");
        }
        return null;
    }

    private void normalize(Promotion promotion) {
        promotion.setCode(trimToNull(promotion.getCode()) == null
                ? null : promotion.getCode().trim().toUpperCase());
        promotion.setName(trimToNull(promotion.getName()));
        promotion.setDescription(trimToNull(promotion.getDescription()));
        promotion.setImageUrl(trimToNull(promotion.getImageUrl()));
        promotion.setDiscountType(defaultText(promotion.getDiscountType(), "PERCENT").toUpperCase());
        promotion.setStatus(defaultText(promotion.getStatus(), "ONLINE").toUpperCase());
        promotion.setMinOrderAmount(promotion.getMinOrderAmount() == null
                ? BigDecimal.ZERO : promotion.getMinOrderAmount());
        if (promotion.getUsedCount() == null) promotion.setUsedCount(0);
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
