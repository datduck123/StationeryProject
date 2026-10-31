package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CheckoutRequestDTO;
import fpt.edu.vn.stationery.dto.response.CheckoutResponseDTO;

public interface CheckoutService {
    
    /**
     * Khởi tạo quá trình thanh toán:
     * - Chạy lại validate tồn kho thời gian thực.
     * - Lưu thông tin địa chỉ/thanh toán.
     * - Trả về dữ liệu để sẵn sàng tạo Order (hoặc gọi module Order để tạo).
     */
    CheckoutResponseDTO initializeCheckout(Long userId, CheckoutRequestDTO request);
}
