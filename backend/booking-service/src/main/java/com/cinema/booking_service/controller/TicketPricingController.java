package com.cinema.booking_service.controller;

import com.cinema.booking_service.entity.TicketPricing;
import com.cinema.booking_service.repository.TicketPricingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-pricing")
@CrossOrigin("*")
public class TicketPricingController {

    private final TicketPricingRepository ticketPricingRepository;

    public TicketPricingController(TicketPricingRepository ticketPricingRepository) {
        this.ticketPricingRepository = ticketPricingRepository;
    }

    @GetMapping
    public List<TicketPricing> getAllPricing() {
        return ticketPricingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketPricing> getPricingById(@PathVariable Long id) {
        return ticketPricingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPricing(@RequestBody TicketPricing pricing) {
        if (pricing.getDayGroup() == null || pricing.getTimeSlot() == null) {
            return ResponseEntity.badRequest().body("Day group và time slot không được để trống");
        }

        return ResponseEntity.ok(ticketPricingRepository.save(pricing));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePricing(@PathVariable Long id, @RequestBody TicketPricing data) {
        return ticketPricingRepository.findById(id)
                .map(pricing -> {
                    pricing.setDayGroup(data.getDayGroup());
                    pricing.setTimeSlot(data.getTimeSlot());
                    pricing.setStudentPrice(data.getStudentPrice());
                    pricing.setAdultPrice(data.getAdultPrice());
                    pricing.setChildSeniorPrice(data.getChildSeniorPrice());
                    pricing.setMemberOnlinePrice(data.getMemberOnlinePrice());

                    return ResponseEntity.ok(ticketPricingRepository.save(pricing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePricing(@PathVariable Long id) {
        if (!ticketPricingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        ticketPricingRepository.deleteById(id);
        return ResponseEntity.ok("Xóa bảng giá thành công");
    }
}