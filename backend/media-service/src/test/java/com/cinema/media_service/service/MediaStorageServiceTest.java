package com.cinema.media_service.service;

import com.cinema.media_service.entity.MediaAsset;
import com.cinema.media_service.repository.MediaAssetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class MediaStorageServiceTest {

    @Autowired
    private MediaStorageService storageService;

    @Autowired
    private MediaAssetRepository repository;

    @Test
    void storesPngImageWithExpectedMetadata() {
        byte[] png = new byte[] {
                (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A,
                0, 0, 0, 0
        };
        MockMultipartFile file = new MockMultipartFile(
                "file", "poster.png", "image/png", png
        );

        MediaAsset asset = storageService.store(file, "movies", "Áp phích", 1L);

        assertThat(asset.getCategory()).isEqualTo("MOVIES");
        assertThat(asset.getContentType()).isEqualTo("image/png");
        assertThat(asset.getChecksumSha256()).hasSize(64);
        assertThat(asset.getPublicUrl()).isEqualTo("/media/files/" + asset.getId());

        storageService.deleteFile(asset);
        repository.delete(asset);
    }

    @Test
    void rejectsVideoUpload() {
        byte[] mp4 = new byte[] { 0, 0, 0, 24, 'f', 't', 'y', 'p', 'm', 'p', '4', '2' };
        MockMultipartFile file = new MockMultipartFile(
                "file", "trailer.mp4", "video/mp4", mp4
        );

        assertThatThrownBy(() -> storageService.store(file, "movies", null, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("JPG, PNG hoặc WEBP");
    }

    @Test
    void rejectsUnsupportedCategory() {
        byte[] jpeg = new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0 };
        MockMultipartFile file = new MockMultipartFile(
                "file", "image.jpg", "image/jpeg", jpeg
        );

        assertThatThrownBy(() -> storageService.store(file, "trailers", null, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Nhóm ảnh");
    }
}
