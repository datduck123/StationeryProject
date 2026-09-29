package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponseDTO {
    private Long voucherId;
    private String code;
    private BigDecimal discountPercent;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private String status; // ACTIVE, INACTIVE, EXPIRED, UPCOMING, DEPLETED
    private Boolean isValid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
