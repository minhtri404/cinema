package com.cinema.showtime_service.controller;

import com.cinema.showtime_service.entity.Theater;
import com.cinema.showtime_service.repository.TheaterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin("*")
public class TheaterController {

    private final TheaterRepository theaterRepository;

    public TheaterController(TheaterRepository theaterRepository) {
        this.theaterRepository = theaterRepository;
    }

    @GetMapping
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id) {
        return theaterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTheater(@RequestBody Theater theater) {
        if (theater.getName() == null || theater.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Ten rap khong duoc de trong");
        }

        if (theater.getAddress() == null || theater.getAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Dia chi rap khong duoc de trong");
        }

        theater.setName(theater.getName().trim());
        theater.setAddress(theater.getAddress().trim());

        if (theater.getStatus() == null || theater.getStatus().isEmpty()) {
            theater.setStatus("ONLINE");
        }

        if (theater.getRoomCount() == null) {
            theater.setRoomCount(0);
        }

        return ResponseEntity.ok(theaterRepository.save(theater));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTheater(@PathVariable Long id, @RequestBody Theater data) {
        return theaterRepository.findById(id)
                .map(theater -> {
                    theater.setName(data.getName());
                    theater.setAddress(data.getAddress());
                    theater.setCity(data.getCity());
                    theater.setLocation(data.getLocation());
                    theater.setRoomCount(data.getRoomCount());
                    theater.setStatus(data.getStatus());

                    return ResponseEntity.ok(theaterRepository.save(theater));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTheater(@PathVariable Long id) {
        if (!theaterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        theaterRepository.deleteById(id);
        return ResponseEntity.ok("Xoa rap thanh cong");
    }
}
