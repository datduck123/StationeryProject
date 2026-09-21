package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.LoginRequest;
import fpt.edu.vn.stationery.dto.response.AuthResponse;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.UserMapper;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.security.JwtTokenProvider;
import fpt.edu.vn.stationery.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;


    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getRole());
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email đã tồn tại");
    }

    User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword())) // ← mã hóa ở đây
            .fullName(request.getFullName())
            .role(AppConstants.ROLE_USER)
            .build();

    userRepository.save(user);
    String token = jwtTokenProvider.generateToken(user.getEmail());
    return new AuthResponse(token, user.getEmail(), user.getRole());
}

    @Override
    public List<UserResponse> getAllUsers() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }
}
