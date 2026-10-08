package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@stationerystore.com}")
    private String mailFrom;

    @Override
    public void sendOtpEmail(String to, String otpCode, String purpose) {
        String subject = "Verification Code for " + purpose + " - Stationery Store";
        String htmlContent = buildOtpEmailHtml(otpCode, purpose);

        boolean sentViaSmtp = trySendHtmlEmail(to, subject, htmlContent);

        log.info("╔═══════════════════════════════════════════════════════════════════╗");
        log.info("║                    STATIONERY STORE - EMAIL                      ║");
        log.info("╠═══════════════════════════════════════════════════════════════════╣");
        log.info("║  To:       {}", String.format("%-54s", to) + "║");
        log.info("║  Subject:  {}", String.format("%-54s", subject) + "║");
        log.info("║  Purpose:  {}", String.format("%-54s", purpose) + "║");
        log.info("║  OTP Code: {}", String.format("%-54s", otpCode) + "║");
        log.info("║  Validity: 5 Minutes (Expires soon)                              ║");
        log.info("║  Status:   {}", String.format("%-54s", sentViaSmtp ? "Sent via SMTP (HTML+CSS)" : "Logged to Console (HTML+CSS Ready)") + "║");
        log.info("╚═══════════════════════════════════════════════════════════════════╝");
    }

    @Override
    public void sendAccountCredentialsEmail(String to, String fullName, String temporaryPassword) {
        String subject = "Welcome to Stationery Store - Your Account Credentials";
        String htmlContent = buildAccountCredentialsEmailHtml(to, fullName, temporaryPassword);

        boolean sentViaSmtp = trySendHtmlEmail(to, subject, htmlContent);

        // Formatted visual log for console / development preview
        log.info("╔═══════════════════════════════════════════════════════════════════╗");
        log.info("║            STATIONERY STORE - NEW ACCOUNT CREATED                ║");
        log.info("╠═══════════════════════════════════════════════════════════════════╣");
        log.info("║  To:       {}", String.format("%-54s", to) + "║");
        log.info("║  Name:     {}", String.format("%-54s", fullName) + "║");
        log.info("║  Password: {}", String.format("%-54s", temporaryPassword) + "║");
        log.info("║  Notice:   Temporary password generated. User must reset on login.║");
        log.info("║  Status:   {}", String.format("%-54s", sentViaSmtp ? "Sent via SMTP (HTML+CSS)" : "Logged to Console (HTML+CSS Ready)") + "║");
        log.info("╚═══════════════════════════════════════════════════════════════════╝");
    }

    private boolean trySendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            return false;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            return true;
        } catch (MessagingException e) {
            log.warn(">>> Could not send email via SMTP to {}: {}", to, e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn(">>> SMTP dispatch error for {}: {}", to, e.getMessage());
            return false;
        }
    }

    @Override
    public String buildOtpEmailHtml(String otpCode, String purpose) {
        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verification Code</title>
              <style>
                body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .email-header {background: linear-gradient(135deg, #10b981 0%, #047857 100%);; padding: 32px 30px; text-align: center; color: #ffffff; }
                .brand-title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; color: #ffffff; }
                .brand-subtitle { font-size: 14px; color: #c7d2fe; margin: 6px 0 0 0; }
                .email-body { padding: 32px 30px; color: #334155; }
                .otp-box { background: linear-gradient(180deg, #f0f4ff 0%, #e0e7ff 100%); border: 2px dashed #6366f1; border-radius: 10px; padding: 22px 16px; text-align: center; margin: 24px 0; }
                .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #312e81; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; margin: 0; }
                .alert-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 16px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #92400e; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
                <tr>
                  <td align="center">
                    <div style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; text-align: left;">
                      <!-- Header -->
                      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
                        <h1 style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; color: #ffffff;">STATIONERY STORE</h1>
                        <p style="font-size: 14px; color: #c7d2fe; margin: 6px 0 0 0;">Verification Code for {{PURPOSE}}</p>
                      </div>
                      <!-- Body -->
                      <div style="padding: 32px 30px; color: #334155;">
                        <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Hello,</p>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                          You recently requested a one-time verification code for <strong>{{PURPOSE}}</strong>. Please enter the following 6-digit code to complete the verification:
                        </p>
                        <!-- OTP Box -->
                        <div style="background: linear-gradient(180deg, #f0f4ff 0%, #e0e7ff 100%); border: 2px dashed #6366f1; border-radius: 10px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; margin-bottom: 6px;">Your 6-Digit OTP</div>
                          <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #312e81; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; padding-left: 10px;">{{OTP_CODE}}</div>
                        </div>
                        <!-- Alert Box -->
                        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 16px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #92400e;">
                          <strong>Note:</strong> This verification code will expire in <strong>5 minutes</strong>. Never share this code with anyone, including Stationery Store support representatives.
                        </div>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 16px 0 0 0;">
                          If you did not initiate this request, you can safely disregard this email. Your account remains secure.
                        </p>
                      </div>
                      <!-- Footer -->
                      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">Stationery Store Management System</p>
                        <p style="margin: 0;">&copy; 2026 Stationery Store. All rights reserved.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
        return template
                .replace("{{PURPOSE}}", purpose != null ? purpose : "Account Action")
                .replace("{{OTP_CODE}}", otpCode != null ? otpCode : "");
    }

    @Override
    public String buildAccountCredentialsEmailHtml(String to, String fullName, String temporaryPassword) {
        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Stationery Store</title>
              <style>
                body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .email-header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 30px; text-align: center; color: #ffffff; }
                .brand-title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; color: #ffffff; }
                .brand-subtitle { font-size: 14px; color: #99f6e4; margin: 6px 0 0 0; }
                .email-body { padding: 32px 30px; color: #334155; }
                .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
                .alert-box { background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px 16px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #991b1b; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
                <tr>
                  <td align="center">
                    <div style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; text-align: left;">
                      <!-- Header -->
                      <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
                        <h1 style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; color: #ffffff;">STATIONERY STORE</h1>
                        <p style="font-size: 14px; color: #99f6e4; margin: 6px 0 0 0;">Welcome! Your New Account is Ready</p>
                      </div>
                      <!-- Body -->
                      <div style="padding: 32px 30px; color: #334155;">
                        <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Dear {{FULL_NAME}},</p>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                          An administrator has created a new Stationery Store account for you. You can now log in using the temporary credentials provided below:
                        </p>
                        <!-- Credentials Box -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0">
                            <tr>
                              <td width="38%" style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; vertical-align: middle;">Login Email:</td>
                              <td style="font-size: 15px; font-weight: 600; color: #0f172a; vertical-align: middle;">{{TO_EMAIL}}</td>
                            </tr>
                            <tr>
                              <td width="38%" style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; vertical-align: middle;">Temporary Password:</td>
                              <td style="vertical-align: middle;">
                                <code style="display: inline-block; background-color: #e0e7ff; color: #3730a3; font-size: 15px; font-weight: 700; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; padding: 4px 10px; border-radius: 6px; border: 1px solid #c7d2fe;">{{TEMP_PASSWORD}}</code>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <!-- Alert Box -->
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px 16px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #991b1b;">
                          <strong>Security Action Required:</strong> For your protection, please sign in and update your temporary password immediately from your account profile settings.
                        </div>
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 28px 0 16px 0;">
                          <a href="http://localhost:5173/login" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.25);">
                            Sign In to Your Account &rarr;
                          </a>
                        </div>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 16px 0 0 0;">
                          If you have any questions or require assistance, please contact the administrator or store support team.
                        </p>
                      </div>
                      <!-- Footer -->
                      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">Stationery Store Management System</p>
                        <p style="margin: 0;">&copy; 2026 Stationery Store. All rights reserved.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
        return template
                .replace("{{FULL_NAME}}", fullName != null ? fullName : "User")
                .replace("{{TO_EMAIL}}", to != null ? to : "")
                .replace("{{TEMP_PASSWORD}}", temporaryPassword != null ? temporaryPassword : "");
    }
}
