package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;

public interface CartService {

    /**
     * Lấy thông tin giỏ hàng của người dùng.
     *
     * @param userId ID của người dùng
     * @param shippingMethod Phương thức vận chuyển (STANDARD / EXPRESS)
     * @param voucherId ID của voucher (nếu có)
     * @return CartResponseDTO Thông tin chi tiết giỏ hàng
     */
    CartResponseDTO getCart(Long userId, String shippingMethod, Long voucherId);

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * Kiểm tra số lượng tồn kho trước khi thêm hoặc cộng dồn.
     *
     * @param userId ID của người dùng
     * @param request Thông tin sản phẩm và số lượng cần thêm
     * @return CartResponseDTO Giỏ hàng sau khi thêm
     */
    CartResponseDTO addToCart(Long userId, CartItemInputDTO request);

    /**
     * Cập nhật số lượng của một mục trong giỏ hàng (+/-).
     * Kiểm tra số lượng tồn kho thực tế.
     *
     * @param userId ID của người dùng
     * @param cartItemId ID của dòng giỏ hàng cần cập nhật
     * @param quantity Số lượng mới
     * @return CartResponseDTO Giỏ hàng sau khi cập nhật
     */
    CartResponseDTO updateCartItem(Long userId, Long cartItemId, Integer quantity);

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     *
     * @param userId ID của người dùng
     * @param cartItemId ID của dòng giỏ hàng cần xóa
     * @return CartResponseDTO Giỏ hàng sau khi xóa item
     */
    CartResponseDTO removeCartItem(Long userId, Long cartItemId);

    /**
     * Xóa toàn bộ sản phẩm trong giỏ hàng của người dùng.
     *
     * @param userId ID của người dùng
     * @return CartResponseDTO Giỏ hàng trống sau khi xóa
     */
    CartResponseDTO clearCart(Long userId);
}
