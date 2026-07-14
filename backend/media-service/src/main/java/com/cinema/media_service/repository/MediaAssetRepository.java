package com.cinema.media_service.repository;

import com.cinema.media_service.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {
    List<MediaAsset> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, String status);
    List<MediaAsset> findByStatusOrderByCreatedAtDesc(String status);
}
