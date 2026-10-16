package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.CartItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.category", "product.brand"})
    List<CartItem> findByUser_UserIdOrderByCartItemIdAsc(Long userId);

    Optional<CartItem> findByUser_UserIdAndProduct_ProductId(Long userId, Long productId);

    Optional<CartItem> findByCartItemIdAndUser_UserId(Long cartItemId, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CartItem c where c.user.userId = :userId order by c.cartItemId")
    List<CartItem> findAllForCheckout(@Param("userId") Long userId);

    long deleteByUser_UserId(Long userId);
}
