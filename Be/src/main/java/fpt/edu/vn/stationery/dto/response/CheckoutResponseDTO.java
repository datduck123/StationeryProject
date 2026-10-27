package fpt.edu.vn.stationery.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponseDTO {
    
    private String message;
    
    private Long orderId;

    private String orderTrackingCode; // Null until real order is created
    
    private String paymentUrl; // For VNPAY integration
    
    private CartResponseDTO validatedCart;
}
