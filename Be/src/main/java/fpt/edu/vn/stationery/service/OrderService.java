package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderStatsResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;

public interface OrderService {
    OrderDetailResponseDTO createOrder(String email, fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO request);
    PageDTO<OrderResponseDTO> getCustomerOrders(String email, int page, int size);
    PageDTO<OrderResponseDTO> getCustomerOrders(String email, String status, int page, int size);
    OrderDetailResponseDTO getCustomerOrder(Long orderId, String email);
    OrderDetailResponseDTO cancelCustomerOrder(Long orderId, String email);
    PageDTO<OrderResponseDTO> getAllOrders(String status, int page, int size);
    PageDTO<OrderResponseDTO> getAllOrders(String status, String keyword, int page, int size,
                                            String sortBy, String sortDir);
    OrderDetailResponseDTO getOrderForAdmin(Long orderId);
    OrderStatsResponseDTO getOrderStats();
    OrderDetailResponseDTO updateAdminOrderStatus(Long orderId, String status);
}
