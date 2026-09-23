package fpt.edu.vn.stationery.service;

public interface OtpService {
    String generateAndSaveOtp(String email, String type);
    void verifyOtp(String email, String type, String otpCode);
    void deleteOtp(String email, String type);
}

