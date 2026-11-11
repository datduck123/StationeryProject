package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartCalculationRequestDTO {

    @Valid
    private List<CartItemInputDTO> items;

    @Pattern(regexp = "^(?i)(STANDARD|EXPRESS)$", message = "Shipping method must be STANDARD or EXPRESS")
    @Builder.Default
    private String shippingMethod = "STANDARD";

    private Long voucherId;

    private String voucherCode;

    private String shippingAddress;
}
