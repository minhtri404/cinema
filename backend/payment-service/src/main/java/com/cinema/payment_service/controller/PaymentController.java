package com.cinema.payment_service.controller;

import com.cinema.payment_service.client.BookingClient;
import com.cinema.payment_service.dto.CreatePaymentRequest;
import com.cinema.payment_service.dto.PaymentCallbackRequest;
import com.cinema.payment_service.dto.RefundPaymentRequest;
import com.cinema.payment_service.entity.PaymentTransaction;
import com.cinema.payment_service.repository.PaymentTransactionRepository;
import com.cinema.payment_service.security.AuthenticatedUser;
import com.cinema.payment_service.service.PaymentNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentController {
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");


    private final PaymentTransactionRepository repository;
    private final PaymentNotificationService notificationService;
    private final BookingClient bookingClient;

    @Value("${app.vnpay.pay-url}")
    private String vnpayPayUrl;

    @Value("${app.vnpay.return-url}")
    private String vnpayReturnUrl;

    @Value("${app.vnpay.tmn-code}")
    private String vnpayTmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String vnpayHashSecret;

    @GetMapping
    public List<PaymentTransaction> getAll(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        return user.isAdminOrStaff()
                ? repository.findAll()
                : repository.findByUserIdOrderByCreatedAtDesc(user.id());
    }

    @GetMapping("/{id}")
    public PaymentTransaction getById(@PathVariable Long id, HttpServletRequest request) {
        PaymentTransaction transaction = find(id);
        requireOwnerOrStaff(transaction, AuthenticatedUser.from(request));
        return transaction;
    }

    @GetMapping("/booking/{bookingId}")
    public List<PaymentTransaction> getByBooking(
            @PathVariable Long bookingId,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        List<PaymentTransaction> transactions = repository.findByBookingIdOrderByCreatedAtDesc(bookingId);
        if (!user.isAdminOrStaff() && transactions.stream().anyMatch(item -> !user.owns(item.getUserId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem giao dịch này");
        }
        return transactions;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentTransaction create(
            @RequestBody CreatePaymentRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        if (body.bookingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn đặt vé không được để trống");
        }
        if (body.amount() == null || body.amount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền phải lớn hơn 0");
        }

        Long ownerId = user.isAdminOrStaff() && body.userId() != null ? body.userId() : user.id();
        String provider = normalize(body.provider(), "MANUAL");

        PaymentTransaction transaction = PaymentTransaction.builder()
                .bookingId(body.bookingId())
                .userId(ownerId)
                .recipient(notificationService.resolveRecipient(ownerId, user))
                .transactionReference("PAY-" + UUID.randomUUID().toString().replace("-", "").toUpperCase(Locale.ROOT))
                .provider(provider)
                .paymentMethod(normalize(body.paymentMethod(), provider))
                .amount(body.amount())
                .refundedAmount(BigDecimal.ZERO)
                .currency("VND")
                .status("PENDING")
                .description(body.description())
                .build();
        return repository.save(transaction);
    }

    @PostMapping("/vnpay/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createVnpayPayment(
            @RequestBody CreatePaymentRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        PaymentTransaction transaction = createTransaction(body, user, "VNPAY", "VNPAY_QR");
        return Map.of(
                "transaction", transaction,
                "paymentUrl", buildVnpayPaymentUrl(transaction, clientIp(request))
        );
    }

    @GetMapping("/vnpay/return")
    @Transactional
    public Map<String, Object> handleVnpayReturn(@RequestParam Map<String, String> params) {
        if (!verifyVnpaySecureHash(params)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chu ky VNPAY khong hop le");
        }

        String transactionReference = params.get("vnp_TxnRef");
        PaymentTransaction transaction = repository.findByTransactionReference(transactionReference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay giao dich"));

        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = params.getOrDefault("vnp_TransactionStatus", "");
        boolean paid = "00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus.isBlank());

        transaction.setProviderTransactionId(params.get("vnp_TransactionNo"));
        transaction.setCallbackPayload(params.toString());
        if (paid) {
            transaction.setStatus("PAID");
            transaction.setPaidAt(LocalDateTime.now());
        } else {
            transaction.setStatus("FAILED");
        }
        PaymentTransaction saved = repository.save(transaction);

        if (paid) {
            bookingClient.markClientPaid(
                    saved.getBookingId(),
                    saved.getUserId().toString(),
                    "CUSTOMER",
                    saved.getRecipient() == null ? "" : saved.getRecipient(),
                    new BookingClient.BookingPaymentRequest(
                    "VNPAY",
                    saved.getTransactionReference()
            ));
        } else {
            notificationService.paymentFailed(saved);
        }

        return Map.of(
                "success", paid,
                "status", saved.getStatus(),
                "bookingId", saved.getBookingId(),
                "transactionReference", saved.getTransactionReference(),
                "message", paid ? "Thanh toan VNPAY thanh cong" : "Thanh toan VNPAY khong thanh cong"
        );
    }

    @PostMapping("/{id}/complete")
    public PaymentTransaction complete(@PathVariable Long id, HttpServletRequest request) {
        requireStaff(AuthenticatedUser.from(request));
        PaymentTransaction transaction = find(id);
        if ("REFUNDED".equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Giao dịch đã hoàn tiền");
        }
        transaction.setStatus("PAID");
        transaction.setPaidAt(LocalDateTime.now());
        PaymentTransaction saved = repository.save(transaction);
        notificationService.paymentPaid(saved);
        return saved;
    }

    @PostMapping("/{id}/refund")
    @Transactional
    public PaymentTransaction refund(
            @PathVariable Long id,
            @RequestBody RefundPaymentRequest body,
            HttpServletRequest request
    ) {
        requireStaff(AuthenticatedUser.from(request));
        PaymentTransaction transaction = find(id);
        if (!"PAID".equals(transaction.getStatus()) && !"PARTIALLY_REFUNDED".equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ giao dịch đã thanh toán mới được hoàn tiền");
        }
        BigDecimal refund = body.amount() == null ? transaction.getAmount() : body.amount();
        if (refund.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền hoàn phải lớn hơn 0");
        }
        BigDecimal refunded = transaction.getRefundedAmount().add(refund);
        if (refunded.compareTo(transaction.getAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền hoàn vượt quá số tiền đã thanh toán");
        }
        transaction.setRefundedAmount(refunded);
        transaction.setRefundedAt(LocalDateTime.now());
        transaction.setStatus(refunded.compareTo(transaction.getAmount()) == 0 ? "REFUNDED" : "PARTIALLY_REFUNDED");
        PaymentTransaction saved = repository.save(transaction);
        notificationService.paymentRefunded(saved);
        return saved;
    }

    private PaymentTransaction find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch"));
    }

    private void requireOwnerOrStaff(PaymentTransaction transaction, AuthenticatedUser user) {
        if (!user.isAdminOrStaff() && !user.owns(transaction.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem giao dịch này");
        }
    }

    private void requireStaff(AuthenticatedUser user) {
        if (!user.isAdminOrStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cần quyền nhân viên hoặc quản trị viên");
        }
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
    }

    private PaymentTransaction createTransaction(
            CreatePaymentRequest body,
            AuthenticatedUser user,
            String provider,
            String paymentMethod
    ) {
        if (body.bookingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Don dat ve khong duoc de trong");
        }
        if (body.amount() == null || body.amount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "So tien phai lon hon 0");
        }

        Long ownerId = user.isAdminOrStaff() && body.userId() != null ? body.userId() : user.id();
        PaymentTransaction transaction = PaymentTransaction.builder()
                .bookingId(body.bookingId())
                .userId(ownerId)
                .recipient(notificationService.resolveRecipient(ownerId, user))
                .transactionReference("PAY-" + UUID.randomUUID().toString().replace("-", "").toUpperCase(Locale.ROOT))
                .provider(provider)
                .paymentMethod(paymentMethod)
                .amount(body.amount())
                .refundedAmount(BigDecimal.ZERO)
                .currency("VND")
                .status("PENDING")
                .description(body.description())
                .build();
        return repository.save(transaction);
    }

    private String buildVnpayPaymentUrl(PaymentTransaction transaction, String clientIp) {
        ensureVnpayConfigured();

        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        long vnpAmount = transaction.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayTmnCode);
        params.put("vnp_Amount", String.valueOf(vnpAmount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", transaction.getTransactionReference());
        params.put("vnp_OrderInfo", "Thanh toan ve cinema #" + transaction.getBookingId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayReturnUrl);
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", formatter.format(now));
        params.put("vnp_ExpireDate", formatter.format(now.plusMinutes(15)));

        String hashData = buildVnpayQuery(params);
        String query = buildVnpayQuery(params);
        String secureHash = hmacSha512(vnpayHashSecret, hashData);
        return vnpayPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private boolean verifyVnpaySecureHash(Map<String, String> rawParams) {
        ensureVnpayConfigured();
        String secureHash = rawParams.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) return false;

        Map<String, String> params = new TreeMap<>();
        rawParams.forEach((key, value) -> {
            if (key != null
                    && key.startsWith("vnp_")
                    && !"vnp_SecureHash".equals(key)
                    && !"vnp_SecureHashType".equals(key)
                    && value != null
                    && !value.isBlank()) {
                params.put(key, value);
            }
        });

        String calculated = hmacSha512(vnpayHashSecret, buildVnpayQuery(params));
        return calculated.equalsIgnoreCase(secureHash);
    }

    private String buildVnpayQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the tao chu ky VNPAY");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr() == null ? "127.0.0.1" : request.getRemoteAddr();
    }

    private void ensureVnpayConfigured() {
        if (vnpayTmnCode == null || vnpayTmnCode.isBlank() || "CHANGE_ME".equals(vnpayTmnCode)
                || vnpayHashSecret == null || vnpayHashSecret.isBlank() || "CHANGE_ME".equals(vnpayHashSecret)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Chua cau hinh VNPAY_TMN_CODE va VNPAY_HASH_SECRET");
        }
    }
}
