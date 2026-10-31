package fpt.edu.vn.stationery.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import fpt.edu.vn.stationery.constant.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {

    private Long productId;

    @JsonProperty("id")
    public Long getId() {
        return productId;
    }

    private String sku;

    private String name;

    private BigDecimal price;

    private BigDecimal weightKg;

    @JsonProperty("weight")
    public BigDecimal getWeight() {
        return weightKg;
    }

    private Integer stockQuantity;

    private Integer sold;

    @JsonProperty("stock")
    public Integer getStock() {
        return stockQuantity;
    }

    private Integer sold;

    private Double avgRating;

    private Long reviewCount;

    private String description;

    private String imageUrl;

    @JsonProperty("images")
    public List<String> getImages() {
        if (imageUrl != null && !imageUrl.isBlank()) {
            return List.of(imageUrl);
        }
        return Collections.emptyList();
    }

    private CategorySummaryDTO category;

    private BrandSummaryDTO brand;

    private ProductStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
