package fpt.edu.vn.stationery.service;

public interface EmailService {
    void sendOtpEmail(String to, String otpCode, String purpose);
    void sendAccountCredentialsEmail(String to, String fullName, String temporaryPassword);
    String buildOtpEmailHtml(String otpCode, String purpose);
    String buildAccountCredentialsEmailHtml(String to, String fullName, String temporaryPassword);
}

