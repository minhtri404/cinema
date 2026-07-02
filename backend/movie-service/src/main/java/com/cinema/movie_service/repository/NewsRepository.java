package com.cinema.movie_service.repository;

import com.cinema.movie_service.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsRepository extends JpaRepository<NewsArticle, Long> {
    List<NewsArticle> findAllByOrderByUpdatedAtDescIdDesc();
    boolean existsByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
