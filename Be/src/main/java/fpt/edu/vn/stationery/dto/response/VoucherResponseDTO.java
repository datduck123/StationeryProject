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
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private boolean valid;
}
