    package com.cinema.showtime_service.controller;

import com.cinema.showtime_service.entity.Showtime;
import com.cinema.showtime_service.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ShowtimeController {

    private final ShowtimeRepository showtimeRepository;

    @GetMapping
    public List<Showtime> getAll() {
        return showtimeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Showtime getById(@PathVariable Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu"));
    }

    @PostMapping
    public Showtime create(@RequestBody Showtime showtime) {
        return showtimeRepository.save(showtime);
    }

    @PutMapping("/{id}")
    public Showtime update(@PathVariable Long id, @RequestBody Showtime request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu"));

        showtime.setMovieId(request.getMovieId());
        showtime.setCinemaId(request.getCinemaId());
        showtime.setRoomId(request.getRoomId());
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getEndTime());
        showtime.setPrice(request.getPrice());
        showtime.setStatus(request.getStatus());

        return showtimeRepository.save(showtime);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        showtimeRepository.deleteById(id);
        return "Đã xóa lịch chiếu";
    }
}