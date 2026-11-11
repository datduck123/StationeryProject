package fpt.edu.vn.stationery.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {

    @Builder.Default
    private List<CartItemResponseDTO> items = new ArrayList<>();

    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalWeightKg = BigDecimal.ZERO;

    private String shippingMethod;

    private boolean stockChanged;

    private int totalItemsCount;

    @Builder.Default
    private List<String> notifications = new ArrayList<>();
}
