package com.cinema.media_service.controller;

import com.cinema.media_service.entity.MediaAsset;
import com.cinema.media_service.repository.MediaAssetRepository;
import com.cinema.media_service.security.AuthenticatedUser;
import com.cinema.media_service.service.MediaStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@CrossOrigin("*")
public class MediaController {

    private final MediaAssetRepository repository;
    private final MediaStorageService storageService;

    @GetMapping
    public List<MediaAsset> getAll(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        requireStaff(user);
        return repository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    @GetMapping("/{id}")
    public MediaAsset getById(@PathVariable Long id, HttpServletRequest request) {
        MediaAsset asset = findActive(id);
        requireStaff(AuthenticatedUser.from(request));
        return asset;
    }

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAsset upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "GENERAL") String category,
            @RequestParam(required = false) String altText,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        requireStaff(user);
        return storageService.store(file, category, altText, user.id());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        MediaAsset asset = findActive(id);
        requireStaff(AuthenticatedUser.from(request));
        storageService.deleteFile(asset);
        repository.delete(asset);
    }

    private MediaAsset findActive(Long id) {
        MediaAsset asset = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp"));
        if (!"ACTIVE".equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tệp đã bị xóa");
        }
        return asset;
    }

    private void requireStaff(AuthenticatedUser user) {
        if (!user.isAdminOrStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cần quyền nhân viên hoặc quản trị viên");
        }
    }
}
