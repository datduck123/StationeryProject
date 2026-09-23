package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.TooManyRequestsException;
import fpt.edu.vn.stationery.service.OtpService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class OtpData {
        private String otpCode;
        private Instant expiresAt;
        private Instant lastSentAt;
    }

    private String buildKey(String email, String type) {
        return (email == null ? "" : email.trim().toLowerCase()) + ":" + (type == null ? "" : type.trim().toUpperCase());
    }

    @Override
    public String generateAndSaveOtp(String email, String type) {
        Instant now = Instant.now();
        String key = buildKey(email, type);
        OtpData existing = otpStorage.get(key);

        if (existing != null && existing.getLastSentAt() != null) {
            long secondsElapsed = ChronoUnit.SECONDS.between(existing.getLastSentAt(), now);
            if (secondsElapsed < 60) {
                long waitSeconds = 60 - secondsElapsed;
                throw new TooManyRequestsException("Vui lòng chờ " + waitSeconds + " giây trước khi yêu cầu gửi lại mã");
            }
        }

        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));
        Instant expiresAt = now.plus(5, ChronoUnit.MINUTES);

        otpStorage.put(key, new OtpData(otpCode, expiresAt, now));
        log.info(">>> Generated in-memory OTP for [{} | {}]: {}", email, type, otpCode);

        return otpCode;
    }

    @Override
    public void verifyOtp(String email, String type, String otpCode) {
        Instant now = Instant.now();
        String key = buildKey(email, type);
        OtpData otpData = otpStorage.get(key);

        if (otpData == null) {
            throw new BadRequestException("Mã OTP đã hết hiệu lực, vui lòng lấy mã mới");
        }

        if (otpData.getExpiresAt() != null && otpData.getExpiresAt().isBefore(now)) {
            otpStorage.remove(key);
            throw new BadRequestException("Mã OTP đã hết hiệu lực, vui lòng lấy mã mới");
        }

        if (!otpData.getOtpCode().equals(otpCode)) {
            throw new BadRequestException("Mã OTP không chính xác");
        }
    }

    @Override
    public void deleteOtp(String email, String type) {
        otpStorage.remove(buildKey(email, type));
    }
}
