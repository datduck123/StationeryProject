package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendOtpEmail(String to, String otpCode, String purpose) {
        log.info("==========================================================");
        log.info(">>> [EMAIL NOTIFICATION]");
        log.info(">>> To: {}", to);
        log.info(">>> Subject: Verification Code for {}", purpose);
        log.info(">>> Message: Your 6-digit verification code is: {}", otpCode);
        log.info(">>> Notice: This code will expire in 5 minutes.");
        log.info("==========================================================");
    }

    @Override
    public void sendAccountCredentialsEmail(String to, String fullName, String temporaryPassword) {
        log.info("==========================================================");
        log.info(">>> [EMAIL NOTIFICATION - NEW ACCOUNT]");
        log.info(">>> To: {}", to);
        log.info(">>> Dear: {}", fullName);
        log.info(">>> An administrator has created your account.");
        log.info(">>> Login Email: {}", to);
        log.info(">>> Temporary Password: {}", temporaryPassword);
        log.info(">>> Please sign in and update your password immediately.");
        log.info("==========================================================");
    }
}

