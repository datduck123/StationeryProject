package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.entity.CartItem;
import fpt.edu.vn.stationery.entity.Payment;
import fpt.edu.vn.stationery.entity.Voucher;
import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderStatsResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.event.OrderStatusChangedEvent;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.repository.PaymentRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;
import java.util.Set;

@Slf4j
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
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final CartItemRepository cartItemRepository;
    private final VoucherRepository voucherRepository;
    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderDetailResponseDTO createOrder(String email, CreateOrderRequestDTO request) {
        validateRequest(request);
        if (!StringUtils.hasText(email)) throw new BadRequestException("Authenticated customer is required");
        // Cart mutations use the same customer lock, so checkout cannot race a cart add/remove.
        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountLockedException("Only ACTIVE customers can create orders");
        }
        List<CartItem> cartItems = cartItemRepository.findAllForCheckout(user.getUserId());
        if (cartItems.isEmpty()) throw new BadRequestException("Your cart is empty");

        // Consistent lock order prevents two overlapping checkouts from overselling products.
        Map<Long, Product> products = new LinkedHashMap<>();
        cartItems.stream().map(item -> item.getProduct().getProductId()).distinct().sorted()
                .forEach(id -> products.put(id, productRepository.findByIdForUpdate(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id))));
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = products.get(cartItem.getProduct().getProductId());
            int quantity = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
            if (quantity < 1) throw new BadRequestException("Invalid cart quantity");
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BadRequestException("Product is currently not available: " + product.getName());
            }
            if (product.getStockQuantity() == null || product.getStockQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
            if (product.getPrice() == null || product.getPrice().signum() < 0
                    || product.getWeightKg() == null || product.getWeightKg().signum() <= 0) {
                throw new BadRequestException("Invalid product price or weight: " + product.getName());
            }
            BigDecimal lineSubtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineSubtotal);
            totalWeight = totalWeight.add(product.getWeightKg().multiply(BigDecimal.valueOf(quantity)));
            orderItems.add(OrderItem.builder().productId(product.getProductId())
                    .productName(product.getName()).unitPrice(product.getPrice())
                    .quantity(quantity).subtotal(lineSubtotal).build());
        }
        Voucher voucher = null;
        BigDecimal discount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getVoucherCode())) {
            voucher = voucherRepository.findByCodeForUpdate(request.getVoucherCode().trim())
                    .orElseThrow(() -> new BadRequestException("Voucher code is invalid"));
            if (!voucher.isUsableAt(LocalDateTime.now(), subtotal)) {
                throw new BadRequestException("Voucher is inactive, expired, depleted, or requires a higher subtotal");
            }
            discount = voucher.calculateDiscount(subtotal);
        }
        String shippingMethod = request.getShippingMethod() == null ? "STANDARD" : request.getShippingMethod();
        String paymentMethod = request.getPaymentMethod() == null ? "COD" : request.getPaymentMethod().trim().toUpperCase();
        if ("VNPAY".equals(paymentMethod)) {
            paymentMethod = "ONLINE";
        }
        BigDecimal shippingFee = CartCalculationServiceImpl.computeShippingFee(shippingMethod, subtotal, totalWeight);
        Order order = Order.builder().user(user).voucherId(voucher == null ? null : voucher.getVoucherId())
                .subtotal(subtotal).discountAmount(discount).shippingMethod(shippingMethod)
                .totalWeight(totalWeight).shippingFee(shippingFee)
                .totalCost(subtotal.subtract(discount).add(shippingFee))
                .shippingAddress(request.getShippingAddress().trim()).phone(request.getPhone().trim())
                .orderStatus("PENDING").note(StringUtils.hasText(request.getNote()) ? request.getNote().trim() : null)
                .build();
        orderItems.forEach(order::addOrderItem);
        for (OrderItem item : orderItems) {
            Product product = products.get(item.getProductId());
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }
        if (voucher != null) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        }
        Order savedOrder = orderRepository.saveAndFlush(order);
        // A payment failure must roll back stock, voucher, order and cart in this transaction.
        paymentRepository.saveAndFlush(Payment.builder().order(savedOrder).paymentMethod(paymentMethod)
                .paymentStatus("PENDING").amount(savedOrder.getTotalCost()).build());
        cartItemRepository.deleteAll(cartItems);
        cartItemRepository.flush();
        return orderMapper.toDetailResponse(savedOrder);
    }

    private void validateRequest(CreateOrderRequestDTO request) {
        if (request == null || !StringUtils.hasText(request.getShippingAddress())
                || request.getShippingAddress().length() > 255
                || !StringUtils.hasText(request.getPhone())
                || !request.getPhone().matches("^[0-9+\\-\\s]{8,20}$")) {
            throw new BadRequestException("Valid shipping address and phone are required");
        }
        if (request.getShippingMethod() != null && !Set.of("STANDARD", "EXPRESS").contains(request.getShippingMethod())) {
            throw new BadRequestException("Shipping method must be STANDARD or EXPRESS");
        }
        if (request.getPaymentMethod() != null && !Set.of("COD", "ONLINE", "VNPAY").contains(request.getPaymentMethod().trim().toUpperCase())) {
            throw new BadRequestException("Payment method must be COD, ONLINE, or VNPAY");
        }
        if (request.getNote() != null && request.getNote().length() > 500) throw new BadRequestException("Order note is too long");
        if (request.getVoucherCode() != null && request.getVoucherCode().length() > 50) throw new BadRequestException("Voucher code is too long");
    }

    @Override
    public PageDTO<OrderResponseDTO> getCustomerOrders(String email, int page, int size) {
        return getCustomerOrders(email, null, page, size);
    }

    @Override
    public PageDTO<OrderResponseDTO> getCustomerOrders(String email, String status, int page, int size) {
        Pageable pageable = pageable(page, size);
        String normalizedStatus = StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())
                ? status.trim().toUpperCase() : null;
        Page<OrderResponseDTO> orders = orderRepository
                .findCustomerOrders(email, normalizedStatus, pageable)
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
        Order order = orderRepository.findForStatusUpdate(orderId)
                .filter(candidate -> candidate.getUser().getEmail().equalsIgnoreCase(email))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new BadRequestException("Only PENDING orders can be cancelled. Current status: " + order.getOrderStatus());
        }
        releaseOrderResources(order);
        order.setOrderStatus("CANCELLED");
        orderRepository.saveAndFlush(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getOrderId(), "PENDING", "CANCELLED", order.getUser().getUserId()));
        return orderMapper.toDetailResponse(order);
    }

    private void releaseOrderResources(Order order) {
        paymentRepository.findByOrderIdForUpdate(order.getOrderId()).ifPresent(payment -> {
            if ("SUCCESS".equals(payment.getPaymentStatus())) {
                throw new BadRequestException("Paid orders require a payment refund before cancellation");
            }
            if ("PENDING".equals(payment.getPaymentStatus())) {
                payment.setPaymentStatus("FAILED");
                paymentRepository.saveAndFlush(payment);
            }
        });
        for (OrderItem item : order.getOrderItems().stream()
                .sorted(Comparator.comparing(OrderItem::getProductId)).toList()) {
            Product product = productRepository.findByIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ordered product no longer exists"));
            product.setStockQuantity(Math.addExact(product.getStockQuantity(), item.getQuantity()));
            productRepository.save(product);
        }
        if (order.getVoucherId() != null) {
            Voucher voucher = voucherRepository.findByIdForUpdate(order.getVoucherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order voucher no longer exists"));
            voucher.setUsedCount(Math.max(0, voucher.getUsedCount() - 1));
            voucherRepository.save(voucher);
        }
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
    public OrderStatsResponseDTO getOrderStats() {
        return OrderStatsResponseDTO.builder()
                .totalOrders(orderRepository.count())
                .deliveredOrders(orderRepository.countByOrderStatus("DELIVERED"))
                .cancelledOrders(orderRepository.countByOrderStatus("CANCELLED"))
                .deliveredRevenue(orderRepository.sumDeliveredRevenue())
                .build();
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

        if ("CANCELLED".equals(next)) releaseOrderResources(order);
        if ("DELIVERED".equals(next)) {
            paymentRepository.findByOrderIdForUpdate(orderId).ifPresent(payment -> {
                if ("COD".equals(payment.getPaymentMethod()) && "PENDING".equals(payment.getPaymentStatus())) {
                    payment.setPaymentStatus("SUCCESS");
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.saveAndFlush(payment);
                }
            });
            // Increment sold count for each ordered product
            for (OrderItem item : order.getOrderItems().stream()
                    .sorted(Comparator.comparing(OrderItem::getProductId)).toList()) {
                productRepository.findByIdForUpdate(item.getProductId()).ifPresent(product -> {
                    product.setSold(Math.addExact(product.getSold() == null ? 0 : product.getSold(), item.getQuantity()));
                    productRepository.save(product);
                });
            }
        }

        order.setOrderStatus(next);
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
