package com.cinema.media_service.service;

import com.cinema.media_service.entity.MediaAsset;
import com.cinema.media_service.entity.MediaCategory;
import com.cinema.media_service.repository.MediaAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaStorageService {

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final MediaAssetRepository repository;

    @Value("${app.media.upload-dir}")
    private String uploadDir;

    @Value("${app.media.max-image-size-bytes:5242880}")
    private long maxImageSizeBytes;

    public MediaAsset store(MultipartFile file, String categoryValue, String altText, Long ownerId) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh không được để trống");
        }
        if (file.getSize() > maxImageSizeBytes) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh không được vượt quá 5 MB");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đọc dữ liệu ảnh", ex);
        }

        String detectedType = detectImageType(content);
        String declaredType = file.getContentType();
        if ("image/jpg".equalsIgnoreCase(declaredType)) declaredType = "image/jpeg";
        if (declaredType != null && !declaredType.isBlank()
                && !"application/octet-stream".equalsIgnoreCase(declaredType.trim())
                && !detectedType.equalsIgnoreCase(declaredType.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung ảnh không khớp với định dạng khai báo");
        }

        MediaCategory category = MediaCategory.from(categoryValue);
        String categoryFolder = category.name().toLowerCase(Locale.ROOT);
        String storedName = UUID.randomUUID() + EXTENSIONS.get(detectedType);
        Path root = rootPath();
        Path relativePath = Path.of(categoryFolder, storedName);
        Path destination = root.resolve(relativePath).normalize();
        if (!destination.startsWith(root)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn lưu tệp không hợp lệ");
        }

        try {
            Files.createDirectories(destination.getParent());
            Files.write(destination, content);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu ảnh", ex);
        }

        MediaAsset asset = MediaAsset.builder()
                .ownerId(ownerId)
                .category(category.name())
                .originalName(safeOriginalName(file.getOriginalFilename(), storedName))
                .storedName(storedName)
                .contentType(detectedType)
                .sizeBytes(file.getSize())
                .checksumSha256(sha256(content))
                .storageType("LOCAL")
                .storagePath(relativePath.toString().replace('\\', '/'))
                .publicUrl("/media/files/pending")
                .altText(altText)
                .status("ACTIVE")
                .build();
        asset = repository.save(asset);
        asset.setPublicUrl("/media/files/" + asset.getId());
        return repository.save(asset);
    }

    public Resource load(MediaAsset asset) {
        try {
            Path path = rootPath().resolve(asset.getStoragePath()).normalize();
            if (!path.startsWith(rootPath())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn tệp không hợp lệ");
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp");
            }
            return resource;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp", ex);
        }
    }

    public void deleteFile(MediaAsset asset) {
        try {
            Path path = rootPath().resolve(asset.getStoragePath()).normalize();
            if (path.startsWith(rootPath())) Files.deleteIfExists(path);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xóa tệp", ex);
        }
    }

    private Path rootPath() {
        return Path.of(uploadDir).toAbsolutePath().normalize();
    }

    private String detectImageType(byte[] content) {
        if (content.length >= 3
                && unsigned(content[0]) == 0xFF
                && unsigned(content[1]) == 0xD8
                && unsigned(content[2]) == 0xFF) {
            return "image/jpeg";
        }
        if (content.length >= 8
                && unsigned(content[0]) == 0x89
                && content[1] == 'P' && content[2] == 'N' && content[3] == 'G'
                && unsigned(content[4]) == 0x0D && unsigned(content[5]) == 0x0A
                && unsigned(content[6]) == 0x1A && unsigned(content[7]) == 0x0A) {
            return "image/png";
        }
        if (content.length >= 12
                && content[0] == 'R' && content[1] == 'I' && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'E' && content[10] == 'B' && content[11] == 'P') {
            return "image/webp";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP hợp lệ");
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private String safeOriginalName(String originalName, String fallback) {
        if (originalName == null || originalName.isBlank()) return fallback;
        String normalized = originalName.replace('\\', '/');
        int separator = normalized.lastIndexOf('/');
        return separator >= 0 ? normalized.substring(separator + 1) : normalized;
    }

    private String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Máy chủ không hỗ trợ SHA-256", ex);
        }
    }
}
