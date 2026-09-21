package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.LoginRequest;
import fpt.edu.vn.stationery.dto.response.AuthResponse;
import fpt.edu.vn.stationery.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }
}
