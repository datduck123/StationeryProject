package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.OrderItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN FETCH oi.order o " +
            "JOIN FETCH o.user " +
            "WHERE oi.orderItemId = :orderItemId")
    Optional<OrderItem> findForReview(@Param("orderItemId") Long orderItemId);

    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN oi.order o " +
            "JOIN o.user u " +
            "WHERE LOWER(u.email) = LOWER(:email) " +
            "AND oi.productId = :productId " +
            "AND UPPER(o.orderStatus) = 'DELIVERED' " +
            "AND NOT EXISTS (SELECT r.reviewId FROM Review r WHERE r.orderItem.orderItemId = oi.orderItemId) " +
            "ORDER BY o.createdAt DESC, oi.orderItemId DESC")
    List<OrderItem> findEligibleItemsForReview(@Param("email") String email, @Param("productId") Long productId);
}
