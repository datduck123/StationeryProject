package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT c FROM CartItem c JOIN FETCH c.product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE c.user.userId = :userId ORDER BY c.cartItemId ASC")
    List<CartItem> findWithProductByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM CartItem c JOIN FETCH c.product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE c.user.email = :email ORDER BY c.cartItemId ASC")
    List<CartItem> findWithProductByUserEmail(@Param("email") String email);

    List<CartItem> findByUser_UserId(Long userId);

    Optional<CartItem> findByUser_UserIdAndProduct_ProductId(Long userId, Long productId);

    void deleteByUser_UserId(Long userId);

    void deleteByUser_UserIdAndProduct_ProductId(Long userId, Long productId);
}
