package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.Promotion;
import com.cinema.booking_service.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody ApplyPromotionRequest request) {
        if (request == null || request.code() == null || request.code().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập mã khuyến mãi."));
        }
        BigDecimal orderAmount = request.orderAmount() == null ? BigDecimal.ZERO : request.orderAmount();
        if (orderAmount.signum() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tổng tiền đơn hàng không hợp lệ."));
        }

        Promotion promotion = promotionRepository.findByCodeIgnoreCase(request.code().trim())
                .orElse(null);
        if (promotion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Mã khuyến mãi không tồn tại."));
        }

        ResponseEntity<?> availabilityError = validateAvailability(promotion, orderAmount);
        if (availabilityError != null) return availabilityError;

        BigDecimal discountAmount = calculateDiscount(promotion, orderAmount);
        BigDecimal payableAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);
        return ResponseEntity.ok(Map.of(
                "id", promotion.getId(),
                "code", promotion.getCode(),
                "name", promotion.getName(),
                "discountType", promotion.getDiscountType(),
                "discountValue", promotion.getDiscountValue(),
                "discountAmount", discountAmount,
                "payableAmount", payableAmount,
                "message", "Áp dụng mã khuyến mãi thành công."
        ));
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

    private ResponseEntity<?> validateAvailability(Promotion promotion, BigDecimal orderAmount) {
        LocalDate today = LocalDate.now();
        if (!"ONLINE".equalsIgnoreCase(promotion.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Mã khuyến mãi không còn hoạt động."));
        }
        if (today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Mã khuyến mãi đã hết hạn hoặc chưa đến thời gian áp dụng."));
        }
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0
                && promotion.getUsedCount() != null
                && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Mã khuyến mãi đã hết lượt sử dụng."));
        }
        BigDecimal minOrderAmount = promotion.getMinOrderAmount() == null ? BigDecimal.ZERO : promotion.getMinOrderAmount();
        if (orderAmount.compareTo(minOrderAmount) < 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã.",
                    "minOrderAmount", minOrderAmount
            ));
        }
        return null;
    }

    private BigDecimal calculateDiscount(Promotion promotion, BigDecimal orderAmount) {
        BigDecimal discount;
        if ("FIXED".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = promotion.getDiscountValue();
        } else {
            discount = orderAmount
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        }
        if (promotion.getMaxDiscountAmount() != null && promotion.getMaxDiscountAmount().signum() > 0) {
            discount = discount.min(promotion.getMaxDiscountAmount());
        }
        return discount.min(orderAmount).max(BigDecimal.ZERO);
    }

    public record ApplyPromotionRequest(String code, BigDecimal orderAmount) {
    }
}
