package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequestDTO {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 255, message = "Shipping address must not exceed 255 characters")
    private String shippingAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{8,20}$", message = "Invalid phone number format")
    private String phone;

    @Pattern(regexp = "^(STANDARD|EXPRESS)$", message = "Shipping method must be STANDARD or EXPRESS")
    @Builder.Default
    private String shippingMethod = "STANDARD";

    @Pattern(regexp = "^(COD|ONLINE|VNPAY)$", message = "Payment method must be COD, ONLINE, or VNPAY")
    @Builder.Default
    private String paymentMethod = "COD";

    @Size(max = 50, message = "Voucher code must not exceed 50 characters")
    private String voucherCode;

    @Size(max = 500, message = "Order note must not exceed 500 characters")
    private String note;
}
