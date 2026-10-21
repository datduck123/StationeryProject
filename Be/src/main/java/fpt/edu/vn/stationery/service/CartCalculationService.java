package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;

public interface CartCalculationService {

    /**
     * Hàm cốt lõi tính toán giá trị giỏ hàng:
     * - Tự động đồng bộ và điều chỉnh giảm số lượng nếu tồn kho giảm hoặc hết hàng.
     * - Tính Tạm tính (subtotal).
     * - Tính Phí giao hàng (shipping_fee) theo STANDARD / EXPRESS và cân nặng.
     * - Tính Tổng tiền (total_cost) = subtotal + shipping_fee - discount.
     * 
     * @param request Chứa danh sách items hoặc phương thức vận chuyển
     * @param userId ID người dùng (nếu có để tự động cập nhật giỏ hàng trong DB)
     * @return CartResponseDTO Kết quả chi tiết và các thông báo cảnh báo kho
     */
    CartResponseDTO calculate(CartCalculationRequestDTO request, Long userId);

    /**
     * Tính toán giỏ hàng cho người dùng từ database (CartItems).
     * 
     * @param userId ID người dùng
     * @param shippingMethod Phương thức vận chuyển (STANDARD / EXPRESS)
     * @param voucherId ID voucher nếu có
     * @return CartResponseDTO
     */
    CartResponseDTO calculateForUser(Long userId, String shippingMethod, Long voucherId);

    /**
     * Hàm dùng chung cho Checkout (OrderService):
     * Thực hiện tính toán và kiểm tra nghiêm ngặt tính sẵn sàng của tồn kho trước khi đặt hàng.
     * Nếu kho bị thay đổi (giảm số lượng hoặc hết hàng), ném CartStockConflictException để chặn đặt hàng.
     * 
     * @param request Dữ liệu checkout
     * @param userId ID người dùng
     * @return CartResponseDTO Kết quả đã được xác thực an toàn cho checkout
     */
    CartResponseDTO validateAndCalculateForCheckout(CartCalculationRequestDTO request, Long userId);
}
