package com.cinema.media_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "media_assets",
        indexes = {
                @Index(name = "idx_media_owner", columnList = "owner_id"),
                @Index(name = "idx_media_category", columnList = "category"),
                @Index(name = "idx_media_status", columnList = "status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "stored_name", nullable = false, unique = true)
    private String storedName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @Column(name = "storage_type", nullable = false, length = 20)
    private String storageType;

    @JsonIgnore
    @Column(name = "storage_path", nullable = false, length = 700)
    private String storagePath;

    @Column(name = "public_url", nullable = false, length = 500)
    private String publicUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (storageType == null || storageType.isBlank()) storageType = "LOCAL";
        if (status == null || status.isBlank()) status = "ACTIVE";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
