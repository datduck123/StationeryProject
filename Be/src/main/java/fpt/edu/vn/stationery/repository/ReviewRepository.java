package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItem_OrderItemId(Long orderItemId);

    @EntityGraph(attributePaths = {"orderItem", "user"})
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.hidden = false")
    Page<Review> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId AND r.hidden = false")
    long countByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.hidden = false")
    Double averageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.productId = :productId AND r.hidden = false GROUP BY r.rating")
    List<Object[]> countGroupByRatingByProductId(@Param("productId") Long productId);
}
