package fpt.edu.vn.stationery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Vouchers", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id")
    private Long voucherId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount;

    @Builder.Default
    @Column(name = "min_order_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "usage_limit", nullable = false)
    private Integer usageLimit;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (usedCount == null) usedCount = 0;
        if (status == null) status = "ACTIVE";
        if (minOrderAmount == null) minOrderAmount = BigDecimal.ZERO;
        if (code != null) code = code.trim().toUpperCase();
    }

    @PreUpdate
    void onUpdate() {
        if (code != null) code = code.trim().toUpperCase();
    }

    public boolean isUsableAt(LocalDateTime now, BigDecimal subtotal) {
        return "ACTIVE".equalsIgnoreCase(status)
                && now != null && !now.isBefore(startDate) && now.isBefore(endDate)
                && usedCount != null && usageLimit != null && usedCount < usageLimit
                && subtotal != null && subtotal.compareTo(minOrderAmount) >= 0;
    }
}
