package fpt.edu.vn.stationery.entity;

import fpt.edu.vn.stationery.constant.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "weight_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal weightKg;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "sold", nullable = false)
    private Integer sold = 0;

    @Column(name = "description", columnDefinition = "NVARCHAR(1000)")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Product(Long productId, Category category, Brand brand, String sku, String name,
                   BigDecimal price, BigDecimal weightKg, Integer stockQuantity, Integer stock,
                   String description, String imageUrl, ProductStatus status,
                   LocalDateTime createdAt, LocalDateTime updatedAt, Integer sold) {
        this.productId = productId;
        this.category = category;
        this.brand = brand;
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.weightKg = weightKg;
        this.stockQuantity = stock != null ? stock : (stockQuantity != null ? stockQuantity : 0);
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status != null ? status : ProductStatus.ACTIVE;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.sold = sold != null ? sold : 0;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (status == null)
            status = ProductStatus.ACTIVE;
        if (stockQuantity == null)
            stockQuantity = 0;
        if (sold == null)
            sold = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Integer getStock() {
        return stockQuantity;
    }

    public void setStock(Integer stock) {
        this.stockQuantity = stock;
    }
}
