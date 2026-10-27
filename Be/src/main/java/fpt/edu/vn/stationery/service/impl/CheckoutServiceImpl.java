package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.request.CheckoutRequestDTO;
import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.dto.response.CheckoutResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.entity.Voucher;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.service.CartCalculationService;
import fpt.edu.vn.stationery.service.CheckoutService;
import fpt.edu.vn.stationery.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutServiceImpl implements CheckoutService {

    private final CartCalculationService cartCalculationService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public CheckoutResponseDTO initializeCheckout(Long userId, CheckoutRequestDTO request) {
        log.info("Initializing checkout for user: {}, PaymentMethod: {}", userId, request.getPaymentMethod());

        // 1. Validate real-time stock and calculate final price
        CartCalculationRequestDTO calcRequest = CartCalculationRequestDTO.builder()
                .shippingMethod(request.getShippingMethod())
                .voucherId(request.getVoucherId())
                .build();

        CartResponseDTO validatedCart = cartCalculationService.validateAndCalculateForCheckout(calcRequest, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại."));

        // 2. Resolve voucher code if voucherId is provided
        String voucherCode = null;
        if (request.getVoucherId() != null) {
            voucherCode = voucherRepository.findById(request.getVoucherId())
                    .map(Voucher::getCode)
                    .orElse(null);
        }

        // 3. Map payment method
        String paymentMethod = "COD";
        if (request.getPaymentMethod() != null) {
            String pm = request.getPaymentMethod().trim().toUpperCase();
            if ("VNPAY".equals(pm) || "ONLINE".equals(pm)) {
                paymentMethod = "ONLINE";
            }
        }

        // 4. Create real order
        CreateOrderRequestDTO orderRequest = CreateOrderRequestDTO.builder()
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhoneNumber())
                .shippingMethod(request.getShippingMethod() != null ? request.getShippingMethod() : "STANDARD")
                .paymentMethod(paymentMethod)
                .voucherCode(voucherCode)
                .note(request.getOrderNotes())
                .build();

        OrderDetailResponseDTO createdOrder = orderService.createOrder(user.getEmail(), orderRequest);

        return CheckoutResponseDTO.builder()
                .message("Đặt hàng thành công!")
                .orderId(createdOrder.getOrderId())
                .orderTrackingCode(createdOrder.getTrackingCode())
                .paymentUrl(null)
                .validatedCart(validatedCart)
                .build();
    }
}
