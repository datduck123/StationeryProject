package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.LoginRequestDTO;
import fpt.edu.vn.stationery.dto.request.RegisterWithOtpDTO;
import fpt.edu.vn.stationery.dto.request.ResetPasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.SendOtpRequestDTO;
import fpt.edu.vn.stationery.dto.response.LoginResponseDTO;

public interface AuthService {

    void sendRegisterOtp(SendOtpRequestDTO request);

    void verifyAndRegister(RegisterWithOtpDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    void sendForgotPasswordOtp(SendOtpRequestDTO request);

    void verifyForgotPasswordOtp(String email, String otpCode);

    void resetPassword(ResetPasswordRequestDTO request);
}
