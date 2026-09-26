package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.CartItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.CartStockConflictException;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.CartCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartCalculationServiceImpl implements CartCalculationService {

    private static final String METHOD_STANDARD = "STANDARD";
    private static final String METHOD_EXPRESS = "EXPRESS";

    // Cước vận chuyển cơ bản
    private static final BigDecimal STANDARD_BASE_FEE = BigDecimal.valueOf(5.00);
    private static final BigDecimal EXPRESS_BASE_FEE = BigDecimal.valueOf(15.00);

    // Ngưỡng miễn phí vận chuyển cho STANDARD
    private static final BigDecimal STANDARD_FREESHIP_THRESHOLD = BigDecimal.valueOf(100.00);

    // Khối lượng ước tính mặc định cho mỗi món văn phòng phẩm: 0.200 kg
    private static final BigDecimal DEFAULT_UNIT_WEIGHT_KG = BigDecimal.valueOf(0.200);
    private static final BigDecimal OVERWEIGHT_THRESHOLD_KG = BigDecimal.valueOf(5.000);
    private static final BigDecimal OVERWEIGHT_FEE_PER_KG = BigDecimal.valueOf(1.00);

    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    @Transactional
    public CartResponseDTO calculate(CartCalculationRequestDTO request, Long userId) {
        if (request == null) {
            request = CartCalculationRequestDTO.builder().build();
        }

        String shippingMethod = normalizeShippingMethod(request.getShippingMethod());

        // 1. Xác định danh sách items cần tính toán
        List<CartItemInputDTO> inputItems = resolveInputItems(request.getItems(), userId);

        if (inputItems.isEmpty()) {
            return CartResponseDTO.builder()
                    .items(Collections.emptyList())
                    .subtotal(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .shippingFee(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .discountAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .totalCost(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .totalWeightKg(BigDecimal.valueOf(0.001).setScale(3, RoundingMode.HALF_UP))
                    .shippingMethod(shippingMethod)
                    .stockChanged(false)
                    .totalItemsCount(0)
                    .notifications(Collections.emptyList())
                    .build();
        }

        // 2. Truy vấn danh sách Product từ database
        Set<Long> productIds = inputItems.stream()
                .map(CartItemInputDTO::getProductId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getProductId, Function.identity()));

        // Lấy giỏ hàng trong DB nếu có userId để hỗ trợ cập nhật ngược lại
        Map<Long, CartItem> userDbCartMap = (userId != null)
                ? cartItemRepository.findByUser_UserId(userId).stream()
                    .collect(Collectors.toMap(c -> c.getProduct().getProductId(), Function.identity()))
                : Collections.emptyMap();

        List<CartItemResponseDTO> responseItems = new ArrayList<>();
        List<String> notifications = new ArrayList<>();
        boolean stockChanged = false;
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalWeightKg = BigDecimal.ZERO;
        int totalItemsCount = 0;

        // 3. Duyệt từng sản phẩm để kiểm tra tồn kho & tự động điều chỉnh
        for (CartItemInputDTO input : inputItems) {
            Long productId = input.getProductId();
            int requestedQuantity = (input.getQuantity() != null && input.getQuantity() > 0)
                    ? input.getQuantity() : 1;

            Product product = productMap.get(productId);
            CartItem dbCartItem = userDbCartMap.get(productId);
            Long cartItemId = dbCartItem != null ? dbCartItem.getCartItemId() : null;

            if (product == null) {
                stockChanged = true;
                String msg = "Sản phẩm mã #" + productId + " không tồn tại hoặc đã bị xóa.";
                notifications.add(msg);

                responseItems.add(CartItemResponseDTO.builder()
                        .cartItemId(cartItemId)
                        .productId(productId)
                        .productName("Sản phẩm không tồn tại")
                        .sku("N/A")
                        .unitPrice(BigDecimal.ZERO)
                        .requestedQuantity(requestedQuantity)
                        .currentStock(0)
                        .finalQuantity(0)
                        .subtotal(BigDecimal.ZERO)
                        .weightKg(BigDecimal.ZERO)
                        .itemTotalWeightKg(BigDecimal.ZERO)
                        .available(false)
                        .stockAdjusted(true)
                        .message(msg)
                        .build());

                // Xóa khỏi DB nếu có
                if (dbCartItem != null) {
                    cartItemRepository.delete(dbCartItem);
                }
                continue;
            }

            int currentStock = product.getStock() != null ? Math.max(0, product.getStock()) : 0;
            boolean isInactive = product.getStatus() != ProductStatus.ACTIVE;
            BigDecimal unitPrice = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            BigDecimal unitWeight = DEFAULT_UNIT_WEIGHT_KG;

            int finalQuantity = requestedQuantity;
            boolean itemStockAdjusted = false;
            boolean isAvailable = true;
            String itemMessage = null;

            if (isInactive) {
                finalQuantity = 0;
                isAvailable = false;
                itemStockAdjusted = true;
                itemMessage = "Sản phẩm '" + product.getName() + "' hiện ngừng kinh doanh và đã bị loại khỏi giỏ hàng.";
            } else if (currentStock <= 0) {
                finalQuantity = 0;
                isAvailable = false;
                itemStockAdjusted = true;
                itemMessage = "Sản phẩm '" + product.getName() + "' đã hết hàng trong kho.";
            } else if (requestedQuantity > currentStock) {
                // Tự động trừ / điều chỉnh số lượng nếu kho thay đổi
                finalQuantity = currentStock;
                itemStockAdjusted = true;
                itemMessage = "Số lượng sản phẩm '" + product.getName() + "' đã tự động giảm từ "
                        + requestedQuantity + " xuống " + currentStock + " do số lượng tồn kho thay đổi.";
            }

            if (itemStockAdjusted) {
                stockChanged = true;
                notifications.add(itemMessage);

                // Đồng bộ ngược lại giỏ hàng trong DB nếu có userId
                if (dbCartItem != null) {
                    if (finalQuantity <= 0) {
                        cartItemRepository.delete(dbCartItem);
                    } else {
                        dbCartItem.setQuantity(finalQuantity);
                        cartItemRepository.save(dbCartItem);
                    }
                }
            }

            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(finalQuantity));
            BigDecimal itemWeight = unitWeight.multiply(BigDecimal.valueOf(finalQuantity));

            if (isAvailable && finalQuantity > 0) {
                subtotal = subtotal.add(itemSubtotal);
                totalWeightKg = totalWeightKg.add(itemWeight);
                totalItemsCount += finalQuantity;
            }

            responseItems.add(CartItemResponseDTO.builder()
                    .cartItemId(cartItemId)
                    .productId(product.getProductId())
                    .productName(product.getName())
                    .sku(product.getSku())
                    .imageUrl(product.getImageUrl())
                    .unitPrice(unitPrice.setScale(2, RoundingMode.HALF_UP))
                    .requestedQuantity(requestedQuantity)
                    .currentStock(currentStock)
                    .finalQuantity(finalQuantity)
                    .subtotal(itemSubtotal.setScale(2, RoundingMode.HALF_UP))
                    .weightKg(unitWeight.setScale(3, RoundingMode.HALF_UP))
                    .itemTotalWeightKg(itemWeight.setScale(3, RoundingMode.HALF_UP))
                    .available(isAvailable)
                    .stockAdjusted(itemStockAdjusted)
                    .message(itemMessage)
                    .build());
        }

        // Đảm bảo total_weight_kg > 0 theo ràng buộc CHECK của Orders
        if (totalWeightKg.compareTo(BigDecimal.ZERO) <= 0) {
            totalWeightKg = BigDecimal.valueOf(0.001);
        }

        // 4. Tính toán phí vận chuyển (shipping_fee)
        BigDecimal shippingFee = calculateShippingFee(shippingMethod, subtotal, totalWeightKg);

        // 5. Tính giảm giá (discount_amount) nếu có voucher
        BigDecimal discountAmount = calculateDiscount(request.getVoucherId(), subtotal);

        // 6. Tính tổng tiền (total_cost) = subtotal + shippingFee - discountAmount
        BigDecimal totalCost = subtotal.add(shippingFee).subtract(discountAmount);
        if (totalCost.compareTo(BigDecimal.ZERO) < 0) {
            totalCost = BigDecimal.ZERO;
        }

        return CartResponseDTO.builder()
                .items(responseItems)
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .shippingFee(shippingFee.setScale(2, RoundingMode.HALF_UP))
                .discountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP))
                .totalCost(totalCost.setScale(2, RoundingMode.HALF_UP))
                .totalWeightKg(totalWeightKg.setScale(3, RoundingMode.HALF_UP))
                .shippingMethod(shippingMethod)
                .stockChanged(stockChanged)
                .totalItemsCount(totalItemsCount)
                .notifications(notifications)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO calculateForUser(Long userId, String shippingMethod, Long voucherId) {
        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .shippingMethod(shippingMethod)
                .voucherId(voucherId)
                .build();
        return calculate(request, userId);
    }

    @Override
    @Transactional
    public CartResponseDTO validateAndCalculateForCheckout(CartCalculationRequestDTO request, Long userId) {
        CartResponseDTO cartResult = calculate(request, userId);

        // Ràng buộc nghiệp vụ: Nếu kho thay đổi trong lúc checkout -> từ chối và yêu cầu xác nhận lại
        if (cartResult.isStockChanged()) {
            throw new CartStockConflictException(
                    "Tồn kho sản phẩm đã thay đổi trong quá trình thanh toán. Vui lòng kiểm tra lại giỏ hàng.",
                    cartResult
            );
        }

        // Kiểm tra xem giỏ hàng có sản phẩm hợp lệ không
        long validItemsCount = cartResult.getItems().stream()
                .filter(i -> i.isAvailable() && i.getFinalQuantity() > 0)
                .count();

        if (validItemsCount == 0) {
            throw new BadRequestException("Giỏ hàng không có sản phẩm hợp lệ nào để tiến hành đặt hàng.");
        }

        return cartResult;
    }

    /**
     * Xác định danh sách items đầu vào: ưu tiên request.items, nếu rỗng và có userId thì load từ DB.
     */
    private List<CartItemInputDTO> resolveInputItems(List<CartItemInputDTO> requestedItems, Long userId) {
        if (requestedItems != null && !requestedItems.isEmpty()) {
            return requestedItems;
        }

        if (userId != null) {
            List<CartItem> dbItems = cartItemRepository.findByUser_UserId(userId);
            return dbItems.stream()
                    .map(item -> CartItemInputDTO.builder()
                            .productId(item.getProduct().getProductId())
                            .quantity(item.getQuantity())
                            .build())
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    /**
     * Chuẩn hóa và kiểm tra phương thức vận chuyển theo ràng buộc CHECK (STANDARD, EXPRESS)
     */
    private String normalizeShippingMethod(String method) {
        if (!StringUtils.hasText(method)) {
            return METHOD_STANDARD;
        }
        String normalized = method.trim().toUpperCase();
        if (!METHOD_STANDARD.equals(normalized) && !METHOD_EXPRESS.equals(normalized)) {
            throw new BadRequestException("Phương thức vận chuyển không hợp lệ. Chỉ chấp nhận STANDARD hoặc EXPRESS.");
        }
        return normalized;
    }

    /**
     * Tính toán phí giao hàng theo phương thức, tạm tính và trọng lượng
     */
    private BigDecimal calculateShippingFee(String shippingMethod, BigDecimal subtotal, BigDecimal totalWeightKg) {
        // Nếu không có sản phẩm nào hợp lệ, phí vận chuyển bằng 0
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal baseFee;
        if (METHOD_EXPRESS.equalsIgnoreCase(shippingMethod)) {
            baseFee = EXPRESS_BASE_FEE;
        } else {
            // STANDARD: áp dụng miễn phí vận chuyển nếu đạt ngưỡng
            if (subtotal.compareTo(STANDARD_FREESHIP_THRESHOLD) >= 0) {
                baseFee = BigDecimal.ZERO;
            } else {
                baseFee = STANDARD_BASE_FEE;
            }
        }

        // Tính phụ phí nếu vượt quá 5kg
        BigDecimal overweightFee = BigDecimal.ZERO;
        if (totalWeightKg != null && totalWeightKg.compareTo(OVERWEIGHT_THRESHOLD_KG) > 0) {
            BigDecimal extraKg = totalWeightKg.subtract(OVERWEIGHT_THRESHOLD_KG);
            overweightFee = extraKg.multiply(OVERWEIGHT_FEE_PER_KG);
        }

        return baseFee.add(overweightFee);
    }

    /**
     * Tính toán giảm giá từ Voucher (nếu có)
     */
    private BigDecimal calculateDiscount(Long voucherId, BigDecimal subtotal) {
        if (voucherId == null || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        // Có thể mở rộng tích hợp VoucherRepository kiểm tra hạn mức & min_order_amount
        return BigDecimal.ZERO;
    }
}
