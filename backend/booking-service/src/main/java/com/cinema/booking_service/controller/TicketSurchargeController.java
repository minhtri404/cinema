package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.TicketSurcharge;
import com.cinema.booking_service.repository.TicketSurchargeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-surcharges")
@CrossOrigin("*")
public class TicketSurchargeController {

    private final TicketSurchargeRepository ticketSurchargeRepository;

    public TicketSurchargeController(TicketSurchargeRepository ticketSurchargeRepository) {
        this.ticketSurchargeRepository = ticketSurchargeRepository;
    }

    @GetMapping
    public List<TicketSurcharge> getAllSurcharges() {
        return ticketSurchargeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketSurcharge> getSurchargeById(@PathVariable Long id) {
        return ticketSurchargeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSurcharge(@RequestBody TicketSurcharge surcharge) {
        if (surcharge.getSurchargeKey() == null || surcharge.getSurchargeKey().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mã phụ thu không được để trống");
        }

        if (surcharge.getSurchargeName() == null || surcharge.getSurchargeName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên phụ thu không được để trống");
        }

        surcharge.setSurchargeKey(surcharge.getSurchargeKey().trim());
        surcharge.setSurchargeName(surcharge.getSurchargeName().trim());

        if (surcharge.getAmount() == null) {
            surcharge.setAmount(0.0);
        }

        return ResponseEntity.ok(ticketSurchargeRepository.save(surcharge));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSurcharge(@PathVariable Long id, @RequestBody TicketSurcharge data) {
        return ticketSurchargeRepository.findById(id)
                .map(surcharge -> {
                    surcharge.setSurchargeKey(data.getSurchargeKey());
                    surcharge.setSurchargeName(data.getSurchargeName());
                    surcharge.setAmount(data.getAmount());

                    return ResponseEntity.ok(ticketSurchargeRepository.save(surcharge));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSurcharge(@PathVariable Long id) {
        if (!ticketSurchargeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        ticketSurchargeRepository.deleteById(id);
        return ResponseEntity.ok("Xóa phụ thu thành công");
    }
}