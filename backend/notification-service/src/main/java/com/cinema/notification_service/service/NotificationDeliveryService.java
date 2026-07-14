package com.cinema.notification_service.service;

import com.cinema.notification_service.entity.Notification;
import com.cinema.notification_service.repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationDeliveryService {

    private final NotificationRepository repository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.notification.email-enabled:false}")
    private boolean emailEnabled;

    @Value("${app.notification.from-email:no-reply@cinema.local}")
    private String fromEmail;

    public Notification deliver(Notification notification) {
        notification.setAttemptCount((notification.getAttemptCount() == null ? 0 : notification.getAttemptCount()) + 1);
        notification.setFailureReason(null);

        if ("IN_APP".equals(notification.getChannel())) {
            markSent(notification);
            return repository.save(notification);
        }

        if (!"EMAIL".equals(notification.getChannel())) {
            notification.setStatus("FAILED");
            notification.setFailureReason("Kênh thông báo chưa được hỗ trợ");
            return repository.save(notification);
        }

        if (!emailEnabled) {
            notification.setStatus("SKIPPED");
            notification.setFailureReason("Chưa bật cấu hình gửi email SMTP");
            return repository.save(notification);
        }

        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) throw new IllegalStateException("Không có bộ gửi email");

            MimeMessage message = mailSender.createMimeMessage();
            prepareMessage(message, notification, notification.getRecipient());
            mailSender.send(message);
            markSent(notification);
        } catch (RuntimeException | MessagingException error) {
            notification.setStatus("FAILED");
            notification.setFailureReason(shortMessage(error));
        }
        return repository.save(notification);
    }

    public Notification deliverEvent(Notification notification, String emailRecipient, boolean emailRequired) {
        notification.setAttemptCount((notification.getAttemptCount() == null ? 0 : notification.getAttemptCount()) + 1);
        markSent(notification);

        if (emailRequired) {
            deliverEventEmail(notification, emailRecipient);
        } else {
            notification.setEmailRecipient(null);
            notification.setEmailStatus(null);
            notification.setEmailFailureReason(null);
            notification.setEmailSentAt(null);
        }
        return repository.save(notification);
    }

    private void deliverEventEmail(Notification notification, String emailRecipient) {
        notification.setEmailRecipient(emailRecipient);
        notification.setEmailAttemptCount(
                (notification.getEmailAttemptCount() == null ? 0 : notification.getEmailAttemptCount()) + 1
        );
        notification.setEmailFailureReason(null);

        if (emailRecipient == null || emailRecipient.isBlank() || !emailRecipient.contains("@")) {
            notification.setEmailStatus("SKIPPED");
            notification.setEmailFailureReason("Người dùng chưa có địa chỉ email hợp lệ");
            return;
        }
        if (!emailEnabled) {
            notification.setEmailStatus("SKIPPED");
            notification.setEmailFailureReason("Chưa bật cấu hình gửi email SMTP");
            return;
        }

        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) throw new IllegalStateException("Không có bộ gửi email");

            MimeMessage message = mailSender.createMimeMessage();
            prepareMessage(message, notification, emailRecipient);
            mailSender.send(message);
            notification.setEmailStatus("SENT");
            notification.setEmailSentAt(LocalDateTime.now());
            notification.setEmailFailureReason(null);
        } catch (RuntimeException | MessagingException error) {
            notification.setEmailStatus("FAILED");
            notification.setEmailFailureReason(shortMessage(error));
        }
    }

    private void prepareMessage(
            MimeMessage message,
            Notification notification,
            String recipient
    ) throws MessagingException {
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(fromEmail);
        helper.setTo(recipient);
        helper.setSubject(notification.getSubject());
        helper.setText(notification.getContent(), emailTemplateService.render(notification));
    }

    private void markSent(Notification notification) {
        notification.setStatus("SENT");
        notification.setSentAt(LocalDateTime.now());
        notification.setFailureReason(null);
    }

    private String shortMessage(Exception error) {
        String message = error.getMessage();
        if (message == null || message.isBlank()) message = error.getClass().getSimpleName();
        return message.length() > 500 ? message.substring(0, 500) : message;
    }
}
