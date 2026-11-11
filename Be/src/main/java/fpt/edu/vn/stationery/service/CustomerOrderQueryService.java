package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.OrderItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.repository.OrderRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerOrderQueryService {
    private static final Set<String> SORT_FIELDS = Set.of("createdAt", "orderId", "totalCost", "orderStatus");

    private static final String EXTRAS_SQL = """
            SELECT o.order_id, v.code AS voucher_code,
                   payment.payment_method, payment.payment_status
            FROM dbo.Orders o
            LEFT JOIN dbo.Vouchers v ON v.voucher_id = o.voucher_id
            OUTER APPLY (
                SELECT TOP (1) p.payment_method, p.payment_status
                FROM dbo.Payments p
                WHERE p.order_id = o.order_id
                ORDER BY p.created_at DESC, p.payment_id DESC
            ) payment
            WHERE o.order_id IN (:orderIds)
            """;

    private final OrderRepository orderRepository;
    private final EntityManager entityManager;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PageDTO<OrderResponseDTO> getOrders(String email, int page, int size,
                                                String sortBy, String sortDir) {
        return getOrders(email, null, page, size, sortBy, sortDir);
    }

    public PageDTO<OrderResponseDTO> getOrders(String email, String status, int page, int size,
                                                String sortBy, String sortDir) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        if (!SORT_FIELDS.contains(sortBy) ||
                !("asc".equalsIgnoreCase(sortDir) || "desc".equalsIgnoreCase(sortDir))) {
            throw new BadRequestException("Unsupported order sort");
        }

        String normalizedStatus = org.springframework.util.StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())
                ? status.trim().toUpperCase() : null;

        Sort sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy);
        if (!"orderId".equals(sortBy)) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "orderId"));
        }
        Page<Order> orders = orderRepository.findCustomerOrders(email, normalizedStatus, PageRequest.of(page, size, sort));
        if (orders.isEmpty()) {
            return PageDTO.from(orders.map(this::toResponse));
        }

        List<Long> orderIds = orders.getContent().stream().map(Order::getOrderId).toList();
        Map<Long, List<OrderItemResponseDTO>> itemsByOrder = entityManager.createQuery(
                        "SELECT item FROM OrderItem item WHERE item.order.orderId IN :orderIds " +
                                "ORDER BY item.orderItemId", OrderItem.class)
                .setParameter("orderIds", orderIds)
                .getResultList().stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getOrderId(),
                        Collectors.mapping(this::toItemResponse, Collectors.toList())));

        Map<Long, PaymentAndVoucher> extrasByOrder = new HashMap<>();
        Set<Long> reviewedItems = Set.copyOf(entityManager.createQuery(
                        "SELECT r.orderItem.orderItemId FROM Review r WHERE r.orderItem.order.orderId IN :orderIds", Long.class)
                .setParameter("orderIds", orderIds).getResultList());
        jdbcTemplate.query(EXTRAS_SQL, new MapSqlParameterSource("orderIds", orderIds), rs -> {
            extrasByOrder.put(rs.getLong("order_id"), new PaymentAndVoucher(
                    rs.getString("voucher_code"),
                    rs.getString("payment_method"),
                    rs.getString("payment_status")));
        });

        return PageDTO.from(orders.map(order -> {
            OrderResponseDTO response = toResponse(order);
            List<OrderItemResponseDTO> items = itemsByOrder.getOrDefault(order.getOrderId(), List.of());
            items.forEach(item -> item.setReviewed(reviewedItems.contains(item.getOrderItemId())));
            response.setOrderItems(items);
            response.setItemCount(items.stream().mapToInt(OrderItemResponseDTO::getQuantity).sum());
            PaymentAndVoucher extras = extrasByOrder.get(order.getOrderId());
            if (extras != null) {
                response.setVoucherCode(extras.voucherCode());
                response.setPaymentMethod(extras.paymentMethod());
                response.setPaymentStatus(extras.paymentStatus());
            }
            return response;
        }));
    }

    private OrderResponseDTO toResponse(Order order) {
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
                .shippingMethod(order.getShippingMethod())
                .phone(order.getPhone())
                .voucherId(order.getVoucherId())
                .discountAmount(order.getDiscountAmount())
                .orderItems(List.of())
                .build();
    }

    private OrderItemResponseDTO toItemResponse(OrderItem item) {
        return OrderItemResponseDTO.builder()
                .orderItemId(item.getOrderItemId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    private record PaymentAndVoucher(String voucherCode, String paymentMethod, String paymentStatus) {}
}
