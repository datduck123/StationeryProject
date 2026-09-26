package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    public OrderResponseDTO toResponse(Order order) {
        return OrderResponseDTO.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser().getUserId())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .orderStatus(order.getOrderStatus())
                .totalCost(order.getTotalCost())
                .createdAt(order.getCreatedAt())
                .itemCount(order.getOrderItems() == null ? 0 : order.getOrderItems().size())
                .build();
    }

    public OrderDetailResponseDTO toDetailResponse(Order order) {
        return OrderDetailResponseDTO.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser().getUserId())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .voucherId(order.getVoucherId())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingMethod(order.getShippingMethod())
                .totalWeight(order.getTotalWeight())
                .shippingFee(order.getShippingFee())
                .totalCost(order.getTotalCost())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .orderStatus(order.getOrderStatus())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(toOrderItemResponseList(order.getOrderItems()))
                .build();
    }

    public List<OrderItemResponseDTO> toOrderItemResponseList(List<OrderItem> orderItems) {
        if (orderItems == null) return List.of();
        return orderItems.stream().map(this::toOrderItemResponse).toList();
    }

    private OrderItemResponseDTO toOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponseDTO.builder()
                .orderItemId(orderItem.getOrderItemId())
                .productId(orderItem.getProductId())
                .productName(orderItem.getProductName())
                .unitPrice(orderItem.getUnitPrice())
                .quantity(orderItem.getQuantity())
                .subtotal(orderItem.getSubtotal())
                .build();
    }
}
