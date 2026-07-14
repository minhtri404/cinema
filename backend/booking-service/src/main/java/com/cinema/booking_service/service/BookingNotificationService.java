package com.cinema.booking_service.service;

import com.cinema.booking_service.client.UserClient;
import com.cinema.booking_service.entity.Booking;
import com.cinema.booking_service.entity.BookingSeat;
import com.cinema.booking_service.messaging.NotificationRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingNotificationService {

    private final UserClient userClient;
    private final ApplicationEventPublisher publisher;

    public void bookingCreated(Booking booking) {
        publish(
                booking,
                "BOOKING_CREATED",
                "Đặt vé thành công",
                "Đơn vé #" + booking.getId() + " đã được tạo cho ghế " + seatCodes(booking)
                        + ". Tổng tiền: " + money(booking.getTotalAmount()) + ". Vui lòng hoàn tất thanh toán."
        );
    }

    public void bookingPaid(Booking booking) {
        publish(
                booking,
                "BOOKING_PAID",
                "Vé đã được thanh toán",
                "Đơn vé #" + booking.getId() + " đã thanh toán thành công. Ghế: " + seatCodes(booking)
                        + ". Giá trị: " + money(booking.getTotalAmount()) + "."
        );
    }

    public void bookingCancelled(Booking booking) {
        publish(
                booking,
                "BOOKING_CANCELLED",
                "Đơn vé đã bị hủy",
                "Đơn vé #" + booking.getId() + " đã được hủy. Các ghế " + seatCodes(booking)
                        + " đã được mở lại."
        );
    }

    private void publish(Booking booking, String eventType, String subject, String content) {
        UserClient.UserSummary user = getUserSafely(booking.getUserId());
        publisher.publishEvent(new NotificationRequestedEvent(
                eventType + ":" + booking.getId(),
                eventType,
                booking.getUserId(),
                user == null ? null : user.email(),
                "BOOKING",
                booking.getId(),
                subject,
                content,
                LocalDateTime.now()
        ));
    }

    private UserClient.UserSummary getUserSafely(Long userId) {
        try {
            return userClient.getById(userId);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private String seatCodes(Booking booking) {
        if (booking.getSeats() == null || booking.getSeats().isEmpty()) return "—";
        return booking.getSeats().stream()
                .map(BookingSeat::getSeatCode)
                .filter(code -> code != null && !code.isBlank())
                .collect(Collectors.joining(", "));
    }

    private String money(BigDecimal value) {
        if (value == null) return "0đ";
        return String.format("%,.0fđ", value).replace(',', '.');
    }
}
