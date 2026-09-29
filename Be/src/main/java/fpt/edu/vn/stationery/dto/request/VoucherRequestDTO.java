package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.constraints.*;
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
public class VoucherRequestDTO {

    @NotBlank(message = "Voucher code is required")
    @Size(min = 2, max = 50, message = "Voucher code must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Voucher code can only contain letters, digits, dashes, and underscores")
    private String code;

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(value = "0.01", message = "Discount percent must be greater than 0%")
    @DecimalMax(value = "100.00", message = "Discount percent cannot exceed 100%")
    private BigDecimal discountPercent;

    @DecimalMin(value = "0.00", message = "Max discount amount cannot be negative")
    private BigDecimal maxDiscount;

    @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    private Boolean isActive;
}
