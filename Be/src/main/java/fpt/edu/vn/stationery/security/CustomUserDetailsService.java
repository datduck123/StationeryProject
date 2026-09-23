package fpt.edu.vn.stationery.security;

import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Tài khoản của bạn đã bị khóa");
        }

        String role = (user.getIsAdmin() != null && user.getIsAdmin() == 1) ? "ROLE_ADMIN" : "ROLE_CUSTOMER";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority(role))
        );
    }
}
