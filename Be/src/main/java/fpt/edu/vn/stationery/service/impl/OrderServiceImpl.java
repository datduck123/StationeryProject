package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.event.OrderStatusChangedEvent;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED");
    private static final Set<String> ADMIN_SORT_FIELDS = Set.of(
            "createdAt", "orderId", "totalCost", "orderStatus");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public PageDTO<OrderResponseDTO> getCustomerOrders(String email, int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<OrderResponseDTO> orders = orderRepository
                .findByUser_Email(email, pageable)
                .map(orderMapper::toResponse);
        return PageDTO.from(orders);
    }

    @Override
    public OrderDetailResponseDTO getCustomerOrder(Long orderId, String email) {
        Order order = orderRepository.findWithOrderItemsByOrderIdAndUser_Email(orderId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponseDTO cancelCustomerOrder(Long orderId, String email) {
        if (orderRepository.cancelPendingOrder(orderId, email) == 0) {
            OrderDetailResponseDTO existing = getCustomerOrder(orderId, email);
            throw new BadRequestException("Only PENDING orders can be cancelled. Current status: " + existing.getOrderStatus());
        }
        return getCustomerOrder(orderId, email);
    }

    @Override
    public PageDTO<OrderResponseDTO> getAllOrders(String status, int page, int size) {
        return getAllOrders(status, null, page, size, "createdAt", "desc");
    }

    @Override
    public PageDTO<OrderResponseDTO> getAllOrders(String status, String keyword, int page, int size,
                                                   String sortBy, String sortDir) {
        String normalizedStatus = StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())
                ? status.trim().toUpperCase() : null;
        if (normalizedStatus != null && !STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Unknown order status");
        }
        if (!ADMIN_SORT_FIELDS.contains(sortBy) ||
                !("asc".equalsIgnoreCase(sortDir) || "desc".equalsIgnoreCase(sortDir))) {
            throw new BadRequestException("Unsupported order sort");
        }
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        Sort sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy);
        if (!"orderId".equals(sortBy)) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "orderId"));
        }
        Pageable pageable = PageRequest.of(page, size, sort);
        String search = StringUtils.hasText(keyword) ? keyword.trim() : null;
        Page<Order> orders;
        if (search != null) {
            Long orderId = null;
            try {
                orderId = Long.valueOf(search.startsWith("#") ? search.substring(1) : search);
            } catch (NumberFormatException ignored) {
                // Text searches match customer name and email.
            }
            orders = orderRepository.searchAdminOrders(normalizedStatus, search, orderId, pageable);
        } else {
            orders = normalizedStatus != null
                    ? orderRepository.findByOrderStatus(normalizedStatus, pageable)
                    : orderRepository.findAll(pageable);
        }
        return PageDTO.from(orders.map(orderMapper::toResponse));
    }

    @Override
    public OrderDetailResponseDTO getOrderForAdmin(Long orderId) {
        Order order = orderRepository.findWithOrderItemsByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponseDTO updateAdminOrderStatus(Long orderId, String requestedStatus) {
        if (!StringUtils.hasText(requestedStatus)) {
            throw new BadRequestException("Order status is required");
        }
        String next = requestedStatus.trim().toUpperCase();
        Order order = orderRepository.findForStatusUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        String previous = order.getOrderStatus();
        if (!isAllowedTransition(previous, next)) {
            throw new BadRequestException("Cannot change order status from " + previous + " to " + next);
        }
        order.setOrderStatus(next);

        // When order reaches DELIVERED, increment sold count for all items in order
        if ("DELIVERED".equals(next) && !"DELIVERED".equals(previous)) {
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProductId() != null && item.getQuantity() != null && item.getQuantity() > 0) {
                        productRepository.incrementSoldCount(item.getProductId(), item.getQuantity());
                    }
                }
            }
        }

        orderRepository.saveAndFlush(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getOrderId(), previous, next, order.getUser().getUserId()));
        return orderMapper.toDetailResponse(order);
    }

    private boolean isAllowedTransition(String previous, String next) {
        return switch (previous) {
            case "PENDING" -> "CONFIRMED".equals(next) || "CANCELLED".equals(next);
            case "CONFIRMED" -> "SHIPPING".equals(next) || "CANCELLED".equals(next);
            case "SHIPPING" -> "DELIVERED".equals(next);
            default -> false;
        };
    }

    private Pageable pageable(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
