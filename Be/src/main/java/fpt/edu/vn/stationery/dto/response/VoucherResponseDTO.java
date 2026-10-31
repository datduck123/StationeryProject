package fpt.edu.vn.stationery.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponseDTO {
    private Long voucherId;
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal discountPercent;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private Boolean isActive;
    @Builder.Default
    private boolean valid = true;
    @Builder.Default
    private boolean isValid = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class VoucherResponseDTOBuilder {
        public VoucherResponseDTOBuilder valid(boolean valid) {
            this.valid$value = valid;
            this.valid$set = true;
            this.isValid$value = valid;
            this.isValid$set = true;
            return this;
        }

        public VoucherResponseDTOBuilder isValid(boolean isValid) {
            this.isValid$value = isValid;
            this.isValid$set = true;
            this.valid$value = isValid;
            this.valid$set = true;
            return this;
        }
    }
}
