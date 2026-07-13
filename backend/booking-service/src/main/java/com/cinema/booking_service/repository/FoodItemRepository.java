package com.cinema.booking_service.repository;

import com.cinema.booking_service.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findAllByOrderByDisplayOrderAscCreatedAtDesc();
    List<FoodItem> findByCategoryIgnoreCaseOrderByDisplayOrderAscCreatedAtDesc(String category);
    boolean existsBySkuIgnoreCase(String sku);
    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);
}
