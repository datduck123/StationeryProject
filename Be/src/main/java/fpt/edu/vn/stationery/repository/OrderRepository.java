package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    long countByOrderStatus(String orderStatus);

    @Query("SELECT COALESCE(SUM(o.totalCost), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    BigDecimal sumDeliveredRevenue();

    Page<Order> findByUser_Email(String email, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.email = :email " +
            "AND (:status IS NULL OR o.orderStatus = :status)")
    Page<Order> findCustomerOrders(@Param("email") String email,
                                   @Param("status") String status,
                                   Pageable pageable);

    Page<Order> findByOrderStatus(String orderStatus, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN o.user u " +
            "WHERE (:status IS NULL OR o.orderStatus = :status) " +
            "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR o.orderId = :orderId)")
    Page<Order> searchAdminOrders(@Param("status") String status,
                                  @Param("keyword") String keyword,
                                  @Param("orderId") Long orderId,
                                  Pageable pageable);

    @EntityGraph(attributePaths = "orderItems")
    Optional<Order> findWithOrderItemsByOrderIdAndUser_Email(Long orderId, String email);

    @Modifying
    @Query(value = "UPDATE dbo.Orders SET order_status = 'CANCELLED', updated_at = SYSDATETIME() " +
            "WHERE order_id = :orderId AND order_status = 'PENDING' " +
            "AND user_id = (SELECT user_id FROM dbo.Users WHERE email = :email)", nativeQuery = true)
    int cancelPendingOrder(@Param("orderId") Long orderId, @Param("email") String email);

    @EntityGraph(attributePaths = "orderItems")
    Optional<Order> findWithOrderItemsByOrderId(Long orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderId = :orderId")
    Optional<Order> findForStatusUpdate(@Param("orderId") Long orderId);
}
