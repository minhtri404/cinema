package com.cinema.notification_service.service;

import com.cinema.notification_service.entity.Notification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailTemplateService {

    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy", Locale.forLanguageTag("vi-VN"));

    public String render(Notification notification) {
        EmailTheme theme = themeFor(notification.getEventType(), notification.getSubject());
        String subject = escape(defaultText(notification.getSubject(), theme.title()));
        String content = formatContent(notification.getContent());
        String referenceLabel = referenceLabel(notification.getRelatedType());
        String referenceValue = notification.getRelatedId() == null
                ? "—"
                : "#" + notification.getRelatedId();
        String occurredAt = formatDateTime(notification.getCreatedAt());

        return """
                <!doctype html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,'Helvetica Neue',sans-serif;color:#172033;">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">%s</div>
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;">
                    <tr>
                      <td align="center" style="padding:32px 12px;">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 45px rgba(15,23,42,.10);">
                          <tr>
                            <td style="padding:25px 30px;background:#102a43;">
                              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td>
                                    <div style="font-size:22px;line-height:1;font-weight:800;color:#ffffff;letter-spacing:-.3px;">CINEMA</div>
                                    <div style="margin-top:6px;font-size:12px;line-height:1.4;color:#b9cadb;letter-spacing:.8px;text-transform:uppercase;">Trải nghiệm điện ảnh trọn vẹn</div>
                                  </td>
                                  <td align="right">
                                    <span style="display:inline-block;padding:8px 13px;border-radius:999px;background:%s;color:%s;font-size:12px;font-weight:700;">%s</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:34px 30px 12px;">
                              <div style="display:inline-block;width:48px;height:48px;border-radius:15px;background:%s;color:%s;font-size:25px;font-weight:800;line-height:48px;text-align:center;">%s</div>
                              <h1 style="margin:20px 0 8px;font-size:27px;line-height:1.25;color:#14213d;letter-spacing:-.45px;">%s</h1>
                              <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">%s</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 30px 8px;">
                              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
                                <tr>
                                  <td width="50%%" style="padding:17px 20px;border-right:1px solid #e2e8f0;">
                                    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.6px;font-weight:700;">%s</div>
                                    <div style="margin-top:6px;font-size:17px;color:#172033;font-weight:800;">%s</div>
                                  </td>
                                  <td width="50%%" style="padding:17px 20px;">
                                    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.6px;font-weight:700;">Thời gian</div>
                                    <div style="margin-top:6px;font-size:14px;color:#172033;font-weight:700;">%s</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:16px 30px 30px;">
                              <div style="padding:19px 20px;border-left:4px solid %s;border-radius:4px 12px 12px 4px;background:%s;color:#334155;font-size:15px;line-height:1.75;">%s</div>
                              <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.65;">Bạn có thể giữ lại email này để đối chiếu khi cần. Nếu bạn không thực hiện giao dịch, vui lòng liên hệ rạp để được hỗ trợ.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 30px;border-top:1px solid #e8edf3;background:#f8fafc;text-align:center;">
                              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Đây là email tự động từ hệ thống Cinema. Vui lòng không trả lời email này.</p>
                              <p style="margin:5px 0 0;color:#94a3b8;font-size:11px;">© 2026 Cinema Management</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                subject,
                subject,
                theme.badgeBackground(),
                theme.color(),
                escape(theme.badge()),
                theme.softBackground(),
                theme.color(),
                escape(theme.icon()),
                subject,
                escape(theme.subtitle()),
                escape(referenceLabel),
                escape(referenceValue),
                escape(occurredAt),
                theme.color(),
                theme.softBackground(),
                content
        );
    }

    private EmailTheme themeFor(String eventType, String subject) {
        String type = eventType == null ? "" : eventType.trim().toUpperCase(Locale.ROOT);
        if (type.isBlank() && subject != null) {
            String normalizedSubject = subject.trim().toLowerCase(Locale.forLanguageTag("vi-VN"));
            if (normalizedSubject.contains("đặt vé")) type = "BOOKING_CREATED";
            else if (normalizedSubject.contains("thanh toán thành công")) type = "PAYMENT_PAID";
            else if (normalizedSubject.contains("hủy")) type = "BOOKING_CANCELLED";
            else if (normalizedSubject.contains("hoàn tiền")) type = "PAYMENT_REFUNDED";
            else if (normalizedSubject.contains("không thành công")) type = "PAYMENT_FAILED";
        }
        return switch (type) {
            case "BOOKING_CREATED" -> new EmailTheme(
                    "Đặt vé thành công", "Đơn vé của bạn đã được hệ thống ghi nhận.",
                    "Đã đặt vé", "✓", "#2563eb", "#dbeafe", "#eff6ff"
            );
            case "BOOKING_PAID", "PAYMENT_PAID" -> new EmailTheme(
                    "Thanh toán thành công", "Giao dịch của bạn đã được xác nhận.",
                    "Đã thanh toán", "✓", "#15803d", "#dcfce7", "#f0fdf4"
            );
            case "BOOKING_CANCELLED" -> new EmailTheme(
                    "Đơn vé đã được hủy", "Yêu cầu hủy vé đã được hệ thống xử lý.",
                    "Đã hủy", "×", "#dc2626", "#fee2e2", "#fef2f2"
            );
            case "PAYMENT_FAILED" -> new EmailTheme(
                    "Thanh toán chưa thành công", "Giao dịch chưa hoàn tất, bạn có thể thử lại.",
                    "Chưa thành công", "!", "#dc2626", "#fee2e2", "#fef2f2"
            );
            case "PAYMENT_REFUNDED" -> new EmailTheme(
                    "Hoàn tiền thành công", "Khoản hoàn tiền của bạn đã được ghi nhận.",
                    "Đã hoàn tiền", "↺", "#7c3aed", "#ede9fe", "#f5f3ff"
            );
            default -> new EmailTheme(
                    "Thông báo từ Cinema", "Có một cập nhật mới dành cho bạn.",
                    "Thông báo", "i", "#2563eb", "#dbeafe", "#eff6ff"
            );
        };
    }

    private String referenceLabel(String relatedType) {
        if (relatedType == null) return "Mã tham chiếu";
        return switch (relatedType.trim().toUpperCase(Locale.ROOT)) {
            case "BOOKING" -> "Mã đơn vé";
            case "PAYMENT" -> "Mã giao dịch";
            default -> "Mã tham chiếu";
        };
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "—" : DATE_TIME_FORMAT.format(value);
    }

    private String formatContent(String value) {
        String text = defaultText(value, "Thông tin của bạn đã được cập nhật.");
        StringBuilder html = new StringBuilder();
        for (String line : text.replace("\r\n", "\n").split("\n")) {
            if (line.startsWith("QR_IMAGE_URL=")) {
                String qrUrl = line.substring("QR_IMAGE_URL=".length()).trim();
                if (!qrUrl.isBlank()) {
                    html.append("<div style=\"margin:16px 0 4px;text-align:center;\">")
                            .append("<img src=\"")
                            .append(escape(qrUrl))
                            .append("\" alt=\"QR mã vé\" width=\"180\" height=\"180\" style=\"display:inline-block;border:1px solid #e2e8f0;border-radius:14px;padding:10px;background:#fff;\">")
                            .append("</div>");
                }
                continue;
            }
            if (!html.isEmpty()) html.append("<br>");
            html.append(escape(line));
        }
        return html.toString();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private record EmailTheme(
            String title,
            String subtitle,
            String badge,
            String icon,
            String color,
            String badgeBackground,
            String softBackground
    ) {
    }
}
