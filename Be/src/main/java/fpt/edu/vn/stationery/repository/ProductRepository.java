package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

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
}
