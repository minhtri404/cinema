package com.cinema.showtime_service.controller;

import com.cinema.showtime_service.entity.Room;
import com.cinema.showtime_service.repository.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin("*")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public List<Room> getAllRooms(@RequestParam(required = false) Long theaterId) {
        if (theaterId != null) {
            return roomRepository.findByTheaterId(theaterId);
        }

        return roomRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room) {
        if (room.getTheaterId() == null) {
            return ResponseEntity.badRequest().body("Rap khong duoc de trong");
        }

        if (room.getName() == null || room.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Ten phong khong duoc de trong");
        }

        if (room.getSeatCount() == null) {
            room.setSeatCount(0);
        }

        if (room.getStatus() == null || room.getStatus().isEmpty()) {
            room.setStatus("ACTIVE");
        }

        if (room.getType() == null || room.getType().isEmpty()) {
            room.setType("2D");
        }

        room.setName(room.getName().trim());

        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room data) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setTheaterId(data.getTheaterId());
                    room.setName(data.getName());
                    room.setSeatCount(data.getSeatCount());
                    room.setType(data.getType());
                    room.setStatus(data.getStatus());

                    return ResponseEntity.ok(roomRepository.save(room));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        roomRepository.deleteById(id);
        return ResponseEntity.ok("Xoa phong chieu thanh cong");
    }
}
