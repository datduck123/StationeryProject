package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.AdminUpdateUserRequestDTO;
import fpt.edu.vn.stationery.dto.request.ChangePasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.CreateUserByAdminRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateProfileRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.UserProfileResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserStatsResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.UserMapper;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.EmailService;
import fpt.edu.vn.stationery.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserProfileResponseDTO getProfile(String email) {
        String cleanEmail = normalizeEmail(email);
        User user = findUserByEmailOrThrow(cleanEmail);
        return userMapper.toProfileResponseDTO(user);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateProfile(String email, UpdateProfileRequestDTO request) {
        String cleanEmail = normalizeEmail(email);
        User user = findUserByEmailOrThrow(cleanEmail);

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info(">>> Profile updated for user: {}", cleanEmail);
        return userMapper.toProfileResponseDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequestDTO request) {
        String cleanEmail = normalizeEmail(email);
        User user = findUserByEmailOrThrow(cleanEmail);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password cannot be the same as the current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info(">>> Password changed for user: {}", cleanEmail);
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
                stream = stream.filter(User::isAdminRole);
            } else {
                stream = stream.filter(u -> !u.isAdminRole());
            }
        }

        // 4. Sort
        Comparator<User> comparator = resolveComparator(sortBy);
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

        User currentAdmin = findUserByEmailOrThrow(normalizeEmail(currentAdminEmail));

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
        String email = normalizeEmail(request.getEmail());
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

        // Send login credentials via email
        emailService.sendAccountCredentialsEmail(email, user.getFullName(), rawPassword);
        log.info(">>> User created by Admin: {}", email);

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
        log.info(">>> User updated by Admin: userId={}", userId);
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

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase() : "";
    }

    private Comparator<User> resolveComparator(String sortBy) {
        if ("user_id".equalsIgnoreCase(sortBy) || "id".equalsIgnoreCase(sortBy) || "userId".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(User::getUserId, Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("full_name".equalsIgnoreCase(sortBy) || "name".equalsIgnoreCase(sortBy) || "fullName".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(User::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else if ("email".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(User::getEmail, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else {
            return Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        }
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
