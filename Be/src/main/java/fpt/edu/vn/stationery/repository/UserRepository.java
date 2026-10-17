package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    List<User> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(LocalDateTime startDate);
}
