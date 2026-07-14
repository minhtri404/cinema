package com.cinema.notification_service.service;

import com.cinema.notification_service.entity.Notification;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EmailTemplateServiceTest {

    private final EmailTemplateService service = new EmailTemplateService();

    @Test
    void rendersBookingEmailWithReferenceAndEscapedContent() {
        Notification notification = Notification.builder()
                .subject("Đặt vé thành công")
                .content("Đơn vé <b>#6</b> đã được tạo cho ghế A9.")
                .eventType("BOOKING_CREATED")
                .relatedType("BOOKING")
                .relatedId(6L)
                .createdAt(LocalDateTime.of(2026, 7, 14, 21, 5))
                .build();

        String html = service.render(notification);

        assertThat(html)
                .contains("Đã đặt vé")
                .contains("Mã đơn vé")
                .contains("#6")
                .contains("21:05 ngày 14/07/2026")
                .contains("&lt;b&gt;#6&lt;/b&gt;")
                .doesNotContain("<b>#6</b>");
    }

    @Test
    void rendersPaymentStatusTheme() {
        Notification notification = Notification.builder()
                .subject("Thanh toán thành công")
                .content("Đã thanh toán 90.000đ.")
                .eventType("PAYMENT_PAID")
                .relatedType("PAYMENT")
                .relatedId(12L)
                .build();

        assertThat(service.render(notification))
                .contains("Đã thanh toán")
                .contains("Mã giao dịch")
                .contains("#12");
    }
}
