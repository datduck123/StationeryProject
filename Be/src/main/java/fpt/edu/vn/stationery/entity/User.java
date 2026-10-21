package fpt.edu.vn.stationery.entity;

import fpt.edu.vn.stationery.constant.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private Integer isAdmin = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return this.userId;
    }

    public void setId(Long id) {
        this.userId = id;
    }

    public boolean isAdminRole() {
        return this.isAdmin != null && this.isAdmin == 1;
    }

    public String getRoleName() {
        return isAdminRole() ? "ROLE_ADMIN" : "ROLE_CUSTOMER";
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = UserStatus.ACTIVE;
        if (isAdmin == null) isAdmin = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
