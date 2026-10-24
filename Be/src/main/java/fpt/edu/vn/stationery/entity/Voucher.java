package fpt.edu.vn.stationery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers", schema = "dbo")
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

    @Column(name = "discount_amount", precision = 18, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "max_discount", precision = 18, scale = 2)
    private BigDecimal maxDiscount;

    @Builder.Default
    @Column(name = "min_order_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (usedCount == null) usedCount = 0;
        if (minOrderAmount == null) minOrderAmount = BigDecimal.ZERO;
        if (code != null) code = code.trim().toUpperCase();
        if (isActive == null) {
            isActive = !"INACTIVE".equalsIgnoreCase(status);
        }
        if (status == null) {
            status = Boolean.TRUE.equals(isActive) ? "ACTIVE" : "INACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (code != null) code = code.trim().toUpperCase();
        if (isActive == null) {
            isActive = !"INACTIVE".equalsIgnoreCase(status);
        }
        if (status == null) {
            status = Boolean.TRUE.equals(isActive) ? "ACTIVE" : "INACTIVE";
        }
    }

    public Boolean getIsActive() {
        if (isActive != null) return isActive;
        return !"INACTIVE".equalsIgnoreCase(status);
    }

    public void setIsActive(Boolean active) {
        this.isActive = active;
        this.status = Boolean.TRUE.equals(active) ? "ACTIVE" : "INACTIVE";
    }

    public String getStatus() {
        if (status != null) return status;
        return Boolean.TRUE.equals(isActive) ? "ACTIVE" : "INACTIVE";
    }

    public void setStatus(String status) {
        this.status = status;
        this.isActive = !"INACTIVE".equalsIgnoreCase(status);
    }

    public BigDecimal getDiscountAmount() {
        if (discountAmount != null) return discountAmount;
        if (maxDiscount != null) return maxDiscount;
        return BigDecimal.ZERO;
    }

    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
            return discountAmount.min(subtotal);
        }
        if (discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal calculated = subtotal.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (maxDiscount != null && maxDiscount.compareTo(BigDecimal.ZERO) > 0 && calculated.compareTo(maxDiscount) > 0) {
                return maxDiscount.min(subtotal);
            }
            return calculated.min(subtotal);
        }
        return BigDecimal.ZERO;
    }

    public boolean isUsableAt(LocalDateTime now, BigDecimal subtotal) {
        boolean active = Boolean.TRUE.equals(getIsActive()) && !"INACTIVE".equalsIgnoreCase(getStatus());
        return active
                && now != null
                && (startDate == null || !now.isBefore(startDate))
                && (endDate == null || now.isBefore(endDate))
                && (usedCount == null || usageLimit == null || usedCount < usageLimit)
                && (subtotal == null || minOrderAmount == null || subtotal.compareTo(minOrderAmount) >= 0);
    }
}
