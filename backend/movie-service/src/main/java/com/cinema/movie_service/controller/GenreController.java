package com.cinema.movie_service.controller;

import com.cinema.movie_service.entity.Genre;
import com.cinema.movie_service.repository.GenreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@CrossOrigin("*")
public class GenreController {

    private final GenreRepository genreRepository;

    public GenreController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @GetMapping
    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Genre> getGenreById(@PathVariable Long id) {
        return genreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createGenre(@RequestBody Genre genre) {
        if (genre.getName() == null || genre.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Ten the loai khong duoc de trong");
        }

        String name = genre.getName().trim();
        if (genreRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.badRequest().body("The loai da ton tai");
        }

        genre.setName(name);
        if (genre.getActive() == null) {
            genre.setActive(true);
        }

        return ResponseEntity.ok(genreRepository.save(genre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGenre(@PathVariable Long id, @RequestBody Genre data) {
        return genreRepository.findById(id)
                .map(genre -> {
                    genre.setName(data.getName() == null ? genre.getName() : data.getName().trim());
                    genre.setDescription(data.getDescription());
                    genre.setActive(data.getActive() != null ? data.getActive() : true);

                    return ResponseEntity.ok(genreRepository.save(genre));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGenre(@PathVariable Long id) {
        if (!genreRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        genreRepository.deleteById(id);
        return ResponseEntity.ok("Xoa the loai thanh cong");
    }
}
