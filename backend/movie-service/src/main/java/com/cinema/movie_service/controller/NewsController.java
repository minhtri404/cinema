package com.cinema.movie_service.controller;

import com.cinema.movie_service.entity.NewsArticle;
import com.cinema.movie_service.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NewsController {

    private final NewsRepository newsRepository;

    @GetMapping
    public List<NewsArticle> getAll() {
        return newsRepository.findAllByOrderByUpdatedAtDescIdDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsArticle> getById(@PathVariable Long id) {
        return newsRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody NewsArticle article) {
        ResponseEntity<String> error = validate(article, null);
        if (error != null) return error;

        article.setId(null);
        normalize(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(newsRepository.save(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody NewsArticle request) {
        NewsArticle article = newsRepository.findById(id).orElse(null);
        if (article == null) return ResponseEntity.notFound().build();

        ResponseEntity<String> error = validate(request, id);
        if (error != null) return error;

        article.setTitle(request.getTitle());
        article.setImageUrl(request.getImageUrl());
        article.setContent(request.getContent());
        article.setStatus(request.getStatus());
        article.setStaffName(request.getStaffName());
        normalize(article);

        return ResponseEntity.ok(newsRepository.save(article));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!newsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        newsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> validate(NewsArticle article, Long id) {
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tiêu đề tin tức không được để trống.");
        }

        boolean duplicate = id == null
                ? newsRepository.existsByTitleIgnoreCase(article.getTitle().trim())
                : newsRepository.existsByTitleIgnoreCaseAndIdNot(article.getTitle().trim(), id);
        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Tiêu đề tin tức đã tồn tại.");
        }
        return null;
    }

    private void normalize(NewsArticle article) {
        article.setTitle(article.getTitle().trim());
        article.setImageUrl(trimToNull(article.getImageUrl()));
        article.setContent(trimToNull(article.getContent()));
        article.setStatus(defaultText(article.getStatus(), "ONLINE").toUpperCase());
        article.setStaffName(defaultText(article.getStaffName(), "Admin Cinema"));
    }

    private String defaultText(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized == null ? fallback : normalized;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
