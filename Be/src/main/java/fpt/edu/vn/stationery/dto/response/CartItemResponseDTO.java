package fpt.edu.vn.stationery.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {

    private Long cartItemId;

    private Long productId;

    private String productName;

    private String sku;

    private String imageUrl;

    private BigDecimal unitPrice;

    private Integer requestedQuantity;

    private Integer currentStock;

    private Integer finalQuantity;

    private BigDecimal subtotal;

    private BigDecimal weightKg;

    private BigDecimal itemTotalWeightKg;

    private boolean available;

    private boolean stockAdjusted;

    private String message;
}
