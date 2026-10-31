package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    boolean existsByCategoryCategoryId(Long categoryId);

    long countByCategoryCategoryId(Long categoryId);

    boolean existsByBrandBrandId(Long brandId);

    boolean existsBySku(String sku);

    boolean existsBySkuAndProductIdNot(String sku, Long productId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM OrderItems WHERE product_id = :productId", nativeQuery = true)
    long countOrderItemsByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM CartItems WHERE product_id = :productId", nativeQuery = true)
    long countCartItemsByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);

    @Override
    @EntityGraph(attributePaths = { "category", "brand" })
    Page<Product> findAll(@Nullable Specification<Product> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = { "category", "brand" })
    Optional<Product> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.productId = :productId")
    Optional<Product> findByIdForUpdate(@Param("productId") Long productId);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :maxStock ORDER BY p.stockQuantity ASC")
    List<Product> findByStockLessThanEqualOrderByStockAsc(@Param("maxStock") Integer maxStock);

    /**
     * Top products by average review rating (featured section).
     * Only ACTIVE products with at least one visible review are included.
     */
    @EntityGraph(attributePaths = {"category", "brand"})
    @Query(value = "SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
            "AND p.productId IN (SELECT r.productId FROM Review r WHERE r.hidden = false GROUP BY r.productId) " +
            "ORDER BY (SELECT AVG(r.rating) FROM Review r WHERE r.productId = p.productId AND r.hidden = false) DESC")
    List<Product> findTopRatedProducts(Pageable pageable);

    /**
     * Top products by total units sold (best-seller section).
     * Only ACTIVE products are included.
     */
    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.sold DESC, p.productId DESC")
    List<Product> findTopBySoldDesc(Pageable pageable);

    /**
     * Get the average rating for a given product (used when enriching DTO).
     */
    @Query(value = "SELECT AVG(r.rating) FROM Reviews r WHERE r.product_id = :productId AND r.is_hidden = 0", nativeQuery = true)
    Double findAvgRatingByProductId(@Param("productId") Long productId);

    /**
     * Get the review count for a given product.
     */
    @Query(value = "SELECT COUNT(*) FROM Reviews r WHERE r.product_id = :productId AND r.is_hidden = 0", nativeQuery = true)
    Long findReviewCountByProductId(@Param("productId") Long productId);
}
