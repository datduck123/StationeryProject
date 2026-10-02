package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.AppConstants;
import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.*;
import fpt.edu.vn.stationery.dto.response.*;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.UserMapper;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.security.JwtTokenProvider;
import fpt.edu.vn.stationery.service.EmailService;
import fpt.edu.vn.stationery.service.OtpService;
import fpt.edu.vn.stationery.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public void sendRegisterOtp(SendOtpRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        String otpCode = otpService.generateAndSaveOtp(email, AppConstants.TYPE_REGISTER);
        emailService.sendOtpEmail(email, otpCode, "Account Registration");
    }

    @Override
    @Transactional
    public void verifyAndRegister(RegisterWithOtpDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        otpService.verifyOtp(email, AppConstants.TYPE_REGISTER, request.getOtpCode());

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isAdmin(0)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        otpService.deleteOtp(email, AppConstants.TYPE_REGISTER);
        log.info(">>> New user registered successfully: {}", email);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Authenticate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        // 2. Fetch User and verify status
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Your account has been locked. Please contact support for assistance.");
        }

        // 3. Generate token with claims
        String role = (user.getIsAdmin() != null && user.getIsAdmin() == 1) ? "ROLE_ADMIN" : "ROLE_CUSTOMER";
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getUserId(), role);

        return AuthResponse.builder()
                .accessToken(token)
                .token(token)
                .tokenType("Bearer")
                .role(role)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .userId(user.getUserId())
                .build();
    }

    @Override
    public void sendForgotPasswordOtp(SendOtpRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Your account has been locked. Please contact support for assistance.");
        }

        String otpCode = otpService.generateAndSaveOtp(email, AppConstants.TYPE_FORGOT_PASSWORD);
        emailService.sendOtpEmail(email, otpCode, "Password Reset");
    }

    @Override
    public void verifyForgotPasswordOtp(String email, String otpCode) {
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Your account has been locked. Please contact support for assistance.");
        }

        otpService.verifyOtp(cleanEmail, AppConstants.TYPE_FORGOT_PASSWORD, otpCode);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Your account has been locked. Please contact support for assistance.");
        }

        otpService.verifyOtp(email, AppConstants.TYPE_FORGOT_PASSWORD, request.getOtpCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otpService.deleteOtp(email, AppConstants.TYPE_FORGOT_PASSWORD);
        log.info(">>> Password reset successfully for: {}", email);
    }

    @Override
    public UserProfileResponseDTO getProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toProfileResponseDTO(user);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateProfile(String email, UpdateProfileRequestDTO request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info(">>> Profile updated for user: {}", email);
        return userMapper.toProfileResponseDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequestDTO request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password cannot be the same as the current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info(">>> Password changed for user: {}", email);
    }

    @Override
    public PageDTO<UserResponseDTO> getUsersWithPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, String status, String role
    ) {
        List<User> allUsers = userRepository.findAll();

        Stream<User> stream = allUsers.stream();

        // 1. Filter by keyword
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim().toLowerCase();
            stream = stream.filter(u ->
                    (u.getEmail() != null && u.getEmail().toLowerCase().contains(kw)) ||
                    (u.getFullName() != null && u.getFullName().toLowerCase().contains(kw))
            );
        }

        // 2. Filter by status
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            stream = stream.filter(u -> u.getStatus() != null && u.getStatus().name().equalsIgnoreCase(status.trim()));
        }

        // 3. Filter by role
        if (role != null && !role.trim().isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            if ("ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
                stream = stream.filter(u -> u.getIsAdmin() != null && u.getIsAdmin() == 1);
            } else {
                stream = stream.filter(u -> u.getIsAdmin() == null || u.getIsAdmin() == 0);
            }
        }

        // 4. Sort
        Comparator<User> comparator;
        if ("user_id".equalsIgnoreCase(sortBy) || "id".equalsIgnoreCase(sortBy) || "userId".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(User::getUserId, Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("full_name".equalsIgnoreCase(sortBy) || "name".equalsIgnoreCase(sortBy) || "fullName".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(User::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else if ("email".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(User::getEmail, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else {
            comparator = Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        if (!"asc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        List<User> sortedUsers = stream.sorted(comparator).collect(Collectors.toList());

        // 5. Paginate
        int pageNo = Math.max(0, page);
        int pageSize = Math.max(1, size);
        Pageable pageable = PageRequest.of(pageNo, pageSize);

        int start = Math.min(pageNo * pageSize, sortedUsers.size());
        int end = Math.min(start + pageSize, sortedUsers.size());

        List<UserResponseDTO> pageContent = sortedUsers.subList(start, end).stream()
                .map(userMapper::toUserResponseDTO)
                .collect(Collectors.toList());

        Page<UserResponseDTO> userPage = new PageImpl<>(pageContent, pageable, sortedUsers.size());
        return PageDTO.from(userPage);
    }

    @Override
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO toggleUserStatus(Long userId, String currentAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User currentAdmin = userRepository.findByEmail(currentAdminEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Current admin not found"));

        if (currentAdmin.getUserId().equals(userId)) {
            throw new BadRequestException("You cannot lock your own account.");
        }

        UserStatus newStatus = (user.getStatus() == UserStatus.ACTIVE)
                ? UserStatus.BLOCKED
                : UserStatus.ACTIVE;

        user.setStatus(newStatus);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info(">>> Toggled user status for userId: {} -> {}", userId, newStatus);
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO createUserByAdmin(CreateUserByAdminRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        String rawPassword = generateRandomComplexPassword();

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isAdmin(request.getIsAdmin() != null ? request.getIsAdmin() : 0)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Send login credentials via email / console log
        emailService.sendAccountCredentialsEmail(email, user.getFullName(), rawPassword);

        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserByAdmin(Long userId, AdminUpdateUserRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getIsAdmin() != null) user.setIsAdmin(request.getIsAdmin());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                user.setStatus(UserStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    public UserStatsResponseDTO getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long inactiveUsers = userRepository.countByStatus(UserStatus.INACTIVE);
        long blockedUsers = userRepository.countByStatus(UserStatus.BLOCKED);

        return UserStatsResponseDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .blockedUsers(blockedUsers)
                .build();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    private String generateRandomComplexPassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "@#$%^&*!";
        String all = upper + lower + digits + special;

        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(special.charAt(random.nextInt(special.length())));

        for (int i = 4; i < 12; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }
        return sb.toString();
    }
}
