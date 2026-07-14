package com.example.user_service.service;

import com.example.user_service.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@cinema.local}")
    private String fromEmail;

    public void sendActivationEmail(User user) {
        String activationLink = UriComponentsBuilder
                .fromHttpUrl(frontendBaseUrl)
                .path("/verify-email")
                .queryParam("token", user.getEmailVerificationToken())
                .build()
                .toUriString();

        if (!mailEnabled) {
            log.info("Email activation is disabled. Activation link for {}: {}", user.getEmail(), activationLink);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Kích hoạt tài khoản HMCinema");
            message.setText("""
                    Xin chào %s,

                    Cảm ơn bạn đã đăng ký tài khoản HMCinema.
                    Vui lòng bấm vào link bên dưới để kích hoạt tài khoản:

                    %s

                    Link có hiệu lực trong 24 giờ.
                    Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.

                    HMCinema
                    """.formatted(user.getFullName(), activationLink));
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Could not send activation email to {}. Fallback activation link: {}", user.getEmail(), activationLink, ex);
        }
    }
}
