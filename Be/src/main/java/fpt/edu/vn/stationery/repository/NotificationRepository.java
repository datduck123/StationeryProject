package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUser_Email(String email, Pageable pageable);
    Page<Notification> findByUser_EmailAndRead(String email, boolean read, Pageable pageable);
    Optional<Notification> findByIdAndUser_Email(Long id, String email);
}
