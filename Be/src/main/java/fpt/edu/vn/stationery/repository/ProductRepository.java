package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByCategoryCategoryId(Long categoryId);
    boolean existsByBrandBrandId(Long brandId);

    @EntityGraph(attributePaths = {"category", "brand"})
    List<Product> findByStockLessThanEqualOrderByStockAsc(Integer maxStock);
}
