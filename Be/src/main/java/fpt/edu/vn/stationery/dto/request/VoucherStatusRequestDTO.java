package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherStatusRequestDTO {
    @NotNull(message = "Status (isActive) must not be null")
    private Boolean isActive;
}
