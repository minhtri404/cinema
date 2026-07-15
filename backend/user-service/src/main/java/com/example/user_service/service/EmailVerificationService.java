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
            message.setSubject("Xác nhận email nhận ưu đãi HMCinema");
            message.setText("""
                    Xin chào %s,

                    Tài khoản của bạn vẫn có thể đăng nhập và sử dụng website bình thường.
                    Vui lòng bấm vào link bên dưới nếu bạn muốn xác nhận email để nhận ưu đãi thành viên:

                    %s

                    Link có hiệu lực trong 24 giờ.
                    Nếu bạn không yêu cầu email này, vui lòng bỏ qua.

                    HMCinema
                    """.formatted(user.getFullName(), activationLink));
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Could not send activation email to {}. Fallback activation link: {}", user.getEmail(), activationLink, ex);
        }
    }

    public void sendMemberPromotionEmail(User user) {
        String promotionCode = "MEMBER20";
        String promotionText = """
                Xin chào %s,

                Email của bạn đã được xác nhận thành công.
                HMCinema gửi bạn mã ưu đãi thành viên:

                Mã khuyến mãi: %s
                Ưu đãi: Giảm 20%% cho thành viên
                Điều kiện: Đơn từ 150.000đ
                Giảm tối đa: 80.000đ
                Hạn sử dụng: 30/10/2026

                Hãy nhập mã %s khi thanh toán để áp dụng ưu đãi.

                HMCinema
                """.formatted(user.getFullName(), promotionCode, promotionCode);

        if (!mailEnabled) {
            log.info("Mail is disabled. Member promotion email for {}: {}", user.getEmail(), promotionText);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Mã ưu đãi thành viên HMCinema - MEMBER20");
            message.setText(promotionText);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Could not send member promotion email to {}", user.getEmail(), ex);
        }
    }
}
