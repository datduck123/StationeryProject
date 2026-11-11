package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.repository.PaymentRepository;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    private final PaymentRepository paymentRepository;
    private final VoucherRepository voucherRepository;
    private final ReviewRepository reviewRepository;

    public OrderResponseDTO toResponse(Order order) {
        return OrderResponseDTO.builder()
                .orderId(order.getOrderId())
                .trackingCode(order.getTrackingCode())
                .userId(order.getUser().getUserId())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .orderStatus(order.getOrderStatus())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .totalCost(order.getTotalCost())
                .createdAt(order.getCreatedAt())
                .itemCount(order.getOrderItems() == null ? 0 : order.getOrderItems().stream()
                        .mapToInt(OrderItem::getQuantity).sum())
                .build();
    }

    public OrderDetailResponseDTO toDetailResponse(Order order) {
        OrderDetailResponseDTO response = OrderDetailResponseDTO.builder()
                .orderId(order.getOrderId())
                .trackingCode(order.getTrackingCode())
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
        if (order.getVoucherId() != null) {
            voucherRepository.findById(order.getVoucherId()).ifPresent(v -> response.setVoucherCode(v.getCode()));
        }
        paymentRepository.findByOrder_OrderId(order.getOrderId()).ifPresent(payment -> {
            response.setPaymentMethod(payment.getPaymentMethod());
            response.setPaymentStatus(payment.getPaymentStatus());
        });
        return response;
    }

    public List<OrderItemResponseDTO> toOrderItemResponseList(List<OrderItem> orderItems) {
        if (orderItems == null) return List.of();
        return orderItems.stream().map(this::toOrderItemResponse).toList();
    }

    private OrderItemResponseDTO toOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponseDTO.builder()
                .orderItemId(orderItem.getOrderItemId())
                .reviewed(orderItem.getOrderItemId() != null && reviewRepository.existsByOrderItem_OrderItemId(orderItem.getOrderItemId()))
                .productId(orderItem.getProductId())
                .productName(orderItem.getProductName())
                .unitPrice(orderItem.getUnitPrice())
                .quantity(orderItem.getQuantity())
                .subtotal(orderItem.getSubtotal())
                .build();
    }
}
