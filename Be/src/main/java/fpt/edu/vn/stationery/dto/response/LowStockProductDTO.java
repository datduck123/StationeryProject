package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockProductDTO {
    private Long productId;
    private String sku;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String categoryName;
    private String brandName;
    private String status;
}
