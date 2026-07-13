package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.FoodItem;
import com.cinema.booking_service.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FoodItemController {

    private static final Set<String> CATEGORIES = Set.of("POPCORN", "DRINK", "COMBO", "SNACK", "OTHER");
    private static final Set<String> SIZES = Set.of("NONE", "S", "M", "L", "XL");
    private static final Set<String> STATUSES = Set.of("ACTIVE", "INACTIVE", "OUT_OF_STOCK");

    private final FoodItemRepository foodItemRepository;

    @GetMapping
    public List<FoodItem> getAll(@RequestParam(required = false) String category) {
        String normalizedCategory = normalizeText(category);
        if (normalizedCategory != null) {
            return foodItemRepository.findByCategoryIgnoreCaseOrderByDisplayOrderAscCreatedAtDesc(normalizedCategory);
        }
        return foodItemRepository.findAllByOrderByDisplayOrderAscCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getById(@PathVariable Long id) {
        return foodItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FoodItem foodItem) {
        normalize(foodItem);
        ResponseEntity<String> error = validate(foodItem, null);
        if (error != null) return error;

        foodItem.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(foodItemRepository.save(foodItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FoodItem request) {
        FoodItem foodItem = foodItemRepository.findById(id).orElse(null);
        if (foodItem == null) return ResponseEntity.notFound().build();

        normalize(request);
        ResponseEntity<String> error = validate(request, id);
        if (error != null) return error;

        foodItem.setSku(request.getSku());
        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setCategory(request.getCategory());
        foodItem.setSize(request.getSize());
        foodItem.setPrice(request.getPrice());
        foodItem.setCostPrice(request.getCostPrice());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setStockQuantity(request.getStockQuantity());
        foodItem.setLowStockThreshold(request.getLowStockThreshold());
        foodItem.setStatus(request.getStatus());
        foodItem.setDisplayOrder(request.getDisplayOrder());

        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        FoodItem foodItem = foodItemRepository.findById(id).orElse(null);
        if (foodItem == null) return ResponseEntity.notFound().build();
        if (quantity == null || quantity < 0) {
            return ResponseEntity.badRequest().body("Stock quantity must be greater than or equal to 0.");
        }

        foodItem.setStockQuantity(quantity);
        if (quantity == 0) {
            foodItem.setStatus("OUT_OF_STOCK");
        } else if ("OUT_OF_STOCK".equals(foodItem.getStatus())) {
            foodItem.setStatus("ACTIVE");
        }
        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!foodItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        foodItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(FoodItem foodItem, Long id) {
        if (foodItem.getSku() == null || !foodItem.getSku().matches("[A-Z0-9_-]{3,50}")) {
            return ResponseEntity.badRequest()
                    .body("SKU must have 3-50 characters and contain only letters, numbers, hyphen or underscore.");
        }
        if (foodItem.getName() == null || foodItem.getName().isEmpty()) {
            return ResponseEntity.badRequest().body("Food name must not be empty.");
        }

        boolean duplicate = id == null
                ? foodItemRepository.existsBySkuIgnoreCase(foodItem.getSku())
                : foodItemRepository.existsBySkuIgnoreCaseAndIdNot(foodItem.getSku(), id);
        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("SKU already exists.");
        }
        if (!CATEGORIES.contains(foodItem.getCategory())) {
            return ResponseEntity.badRequest().body("Food category is invalid.");
        }
        if (!SIZES.contains(foodItem.getSize())) {
            return ResponseEntity.badRequest().body("Food size is invalid.");
        }
        if (foodItem.getPrice() == null || foodItem.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Price must be greater than 0.");
        }
        if (foodItem.getCostPrice() != null && foodItem.getCostPrice().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("Cost price must be greater than or equal to 0.");
        }
        if (foodItem.getStockQuantity() == null || foodItem.getStockQuantity() < 0) {
            return ResponseEntity.badRequest().body("Stock quantity must be greater than or equal to 0.");
        }
        if (foodItem.getLowStockThreshold() == null || foodItem.getLowStockThreshold() < 0) {
            return ResponseEntity.badRequest().body("Low stock threshold must be greater than or equal to 0.");
        }
        if (!STATUSES.contains(foodItem.getStatus())) {
            return ResponseEntity.badRequest().body("Food status is invalid.");
        }
        return null;
    }

    private void normalize(FoodItem foodItem) {
        foodItem.setSku(normalizeText(foodItem.getSku()) == null
                ? null : foodItem.getSku().trim().toUpperCase());
        foodItem.setName(normalizeText(foodItem.getName()));
        foodItem.setDescription(normalizeText(foodItem.getDescription()));
        foodItem.setImageUrl(normalizeText(foodItem.getImageUrl()));
        foodItem.setCategory(defaultText(foodItem.getCategory(), "OTHER").toUpperCase());
        foodItem.setSize(defaultText(foodItem.getSize(), "NONE").toUpperCase());
        foodItem.setStatus(defaultText(foodItem.getStatus(), "ACTIVE").toUpperCase());
        if (foodItem.getStockQuantity() == null) foodItem.setStockQuantity(0);
        if (foodItem.getLowStockThreshold() == null) foodItem.setLowStockThreshold(10);
        if (foodItem.getDisplayOrder() == null) foodItem.setDisplayOrder(0);
    }

    private String defaultText(String value, String fallback) {
        String normalized = normalizeText(value);
        return normalized == null ? fallback : normalized;
    }

    private String normalizeText(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
