package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;

public interface OrderService {
    PageDTO<OrderResponseDTO> getCustomerOrders(String email, int page, int size);
    OrderDetailResponseDTO getCustomerOrder(Long orderId, String email);
    OrderDetailResponseDTO cancelCustomerOrder(Long orderId, String email);
    PageDTO<OrderResponseDTO> getAllOrders(String status, int page, int size);
    PageDTO<OrderResponseDTO> getAllOrders(String status, String keyword, int page, int size,
                                            String sortBy, String sortDir);
    OrderDetailResponseDTO getOrderForAdmin(Long orderId);
    OrderDetailResponseDTO updateAdminOrderStatus(Long orderId, String status);
}
