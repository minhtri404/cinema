package com.cinema.showtime_service.controller;

import com.cinema.showtime_service.entity.Seat;
import com.cinema.showtime_service.repository.SeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin("*")
public class SeatController {

    private final SeatRepository seatRepository;

    public SeatController(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @GetMapping("/room/{roomId}")
    public List<Seat> getSeatsByRoom(@PathVariable Long roomId) {
        return seatRepository.findByRoomIdOrderBySeatRowAscSeatNumberAsc(roomId);
    }

    @PostMapping("/generate")
    @Transactional
    public ResponseEntity<?> generateSeats(@RequestParam Long roomId,
                                           @RequestParam Integer rowCount,
                                           @RequestParam Integer columnCount) {
        seatRepository.deleteByRoomId(roomId);

        for (int i = 0; i < rowCount; i++) {
            String rowName = String.valueOf((char) ('A' + i));

            for (int j = 1; j <= columnCount; j++) {
                Seat seat = Seat.builder()
                        .roomId(roomId)
                        .seatRow(rowName)
                        .seatNumber(j)
                        .seatCode(rowName + j)
                        .seatType("STANDARD")
                        .extraPrice(0.0)
                        .status("ACTIVE")
                        .build();

                seatRepository.save(seat);
            }
        }

        return ResponseEntity.ok("Tao so do ghe thanh cong");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSeat(@PathVariable Long id, @RequestBody Seat data) {
        return seatRepository.findById(id)
                .map(seat -> {
                    seat.setSeatType(data.getSeatType());
                    seat.setExtraPrice(data.getExtraPrice());
                    seat.setStatus(data.getStatus());

                    return ResponseEntity.ok(seatRepository.save(seat));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
