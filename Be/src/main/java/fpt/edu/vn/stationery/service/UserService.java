package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.LoginRequest;
import fpt.edu.vn.stationery.dto.response.AuthResponse;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    AuthResponse login(LoginRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
}
