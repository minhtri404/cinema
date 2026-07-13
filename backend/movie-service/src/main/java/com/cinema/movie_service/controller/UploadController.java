package com.cinema.movie_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin("*")
public class UploadController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/movies")
    public ResponseEntity<?> uploadMoviePoster(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "movies");
    }

    @PostMapping("/events")
    public ResponseEntity<?> uploadEventImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "events");
    }

    @PostMapping("/news")
    public ResponseEntity<?> uploadNewsImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "news");
    }

    @PostMapping("/promotions")
    public ResponseEntity<?> uploadPromotionImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "promotions");
    }

    @PostMapping("/foods")
    public ResponseEntity<?> uploadFoodImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "foods");
    }

    @PostMapping("/combos")
    public ResponseEntity<?> uploadComboImage(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, "combos");
    }

    private ResponseEntity<?> uploadImage(MultipartFile file, String folder) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File không được rỗng");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.matches("image/(jpeg|png|webp)")) {
                return ResponseEntity.badRequest().body("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Ảnh không được vượt quá 5MB");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + extension;

            Path uploadPath = Paths.get(uploadDir, folder);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/uploads/" + folder + "/" + fileName;

            return ResponseEntity.ok(Map.of(
                    "fileName", fileName,
                    "url", imageUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload ảnh thất bại: " + e.getMessage());
        }
    }
}
