package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private static final int MAX_PAGE_SIZE = 100;

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

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
        Pageable pageable = pageable(page, size);
        Page<Order> orders = StringUtils.hasText(status)
                ? orderRepository.findByOrderStatus(status.trim().toUpperCase(), pageable)
                : orderRepository.findAll(pageable);
        return PageDTO.from(orders.map(orderMapper::toResponse));
    }

    @Override
    public OrderDetailResponseDTO getOrderForAdmin(Long orderId) {
        Order order = orderRepository.findWithOrderItemsByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toDetailResponse(order);
    }

    private Pageable pageable(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
