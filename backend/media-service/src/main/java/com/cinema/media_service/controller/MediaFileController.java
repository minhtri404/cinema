package com.cinema.media_service.controller;

import com.cinema.media_service.entity.MediaAsset;
import com.cinema.media_service.repository.MediaAssetRepository;
import com.cinema.media_service.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/media/files")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MediaFileController {

    private final MediaAssetRepository repository;
    private final MediaStorageService storageService;

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getFile(@PathVariable Long id) {
        MediaAsset asset = repository.findById(id)
                .filter(item -> "ACTIVE".equals(item.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp"));
        Resource resource = storageService.load(asset);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(asset.getContentType());
        } catch (Exception ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .contentType(mediaType)
                .body(resource);
    }
}
