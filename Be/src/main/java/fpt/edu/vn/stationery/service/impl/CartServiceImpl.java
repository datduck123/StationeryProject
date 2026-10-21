package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.CartItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.entity.Voucher;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartServiceImpl implements CartService {

    private static final BigDecimal STANDARD_FEE = new BigDecimal("20000");
    private static final BigDecimal EXPRESS_FEE = new BigDecimal("40000");

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    @Override
    public CartResponseDTO getCart(String email, String shippingMethod, String voucherCode) {
        User user = requireActiveUser(email, false);
        return calculate(user.getUserId(), shippingMethod, voucherCode);
    }

    @Override
    @Transactional
    public CartResponseDTO addItem(String email, CartItemInputDTO request) {
        User user = requireActiveUser(email, true);
        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        int quantity = request.getQuantity();
        requireAvailable(product, quantity);

        CartItem item = cartItemRepository
                .findByUser_UserIdAndProduct_ProductId(user.getUserId(), product.getProductId())
                .orElse(null);
        int nextQuantity = quantity;
        if (item != null) {
            try {
                nextQuantity = Math.addExact(quantity, item.getQuantity());
            } catch (ArithmeticException ex) {
                throw new BadRequestException("Cart quantity exceeds the supported limit");
            }
        }
        requireAvailable(product, nextQuantity);

        if (item == null) {
            item = CartItem.builder().user(user).product(product).quantity(nextQuantity).build();
        } else {
            item.setQuantity(nextQuantity);
        }
        try {
            cartItemRepository.saveAndFlush(item);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("This product is already being updated in your cart. Please retry.");
        }
        return calculate(user.getUserId(), "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO updateItem(String email, Long cartItemId, int quantity) {
        User user = requireActiveUser(email, true);
        CartItem item = cartItemRepository.findByCartItemIdAndUser_UserId(cartItemId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        Product product = productRepository.findByIdForUpdate(item.getProduct().getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        requireAvailable(product, quantity);
        item.setQuantity(quantity);
        cartItemRepository.saveAndFlush(item);
        return calculate(user.getUserId(), "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO removeItem(String email, Long cartItemId) {
        User user = requireActiveUser(email, true);
        CartItem item = cartItemRepository.findByCartItemIdAndUser_UserId(cartItemId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        cartItemRepository.delete(item);
        cartItemRepository.flush();
        return calculate(user.getUserId(), "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO clear(String email) {
        User user = requireActiveUser(email, true);
        cartItemRepository.deleteByUser_UserId(user.getUserId());
        cartItemRepository.flush();
        return calculate(user.getUserId(), "STANDARD", null);
    }

    private CartResponseDTO calculate(Long userId, String requestedMethod, String voucherCode) {
        String shippingMethod = "EXPRESS".equalsIgnoreCase(requestedMethod) ? "EXPRESS" : "STANDARD";
        List<CartItemResponseDTO> items = new ArrayList<>();
        List<String> notifications = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;
        int totalItems = 0;
        boolean stockChanged = false;

        for (CartItem item : cartItemRepository.findByUser_UserIdOrderByCartItemIdAsc(userId)) {
            Product product = item.getProduct();
            int quantity = item.getQuantity();
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            boolean active = product.getStatus() == ProductStatus.ACTIVE;
            boolean available = active && stock >= quantity;
            BigDecimal price = product.getPrice();
            BigDecimal lineSubtotal = price.multiply(BigDecimal.valueOf(quantity));
            BigDecimal unitWeight = product.getWeightKg();
            BigDecimal lineWeight = unitWeight.multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineSubtotal);
            totalWeight = totalWeight.add(lineWeight);
            totalItems += quantity;
            if (!available) {
                stockChanged = true;
                notifications.add(active
                        ? product.getName() + " only has " + stock + " item(s) left"
                        : product.getName() + " is no longer available");
            }
            items.add(CartItemResponseDTO.builder()
                    .cartItemId(item.getCartItemId())
                    .productId(product.getProductId())
                    .productName(product.getName())
                    .sku(product.getSku())
                    .imageUrl(product.getImageUrl())
                    .unitPrice(price)
                    .quantity(quantity)
                    .requestedQuantity(quantity)
                    .finalQuantity(quantity)
                    .currentStock(stock)
                    .subtotal(lineSubtotal)
                    .weightKg(unitWeight)
                    .itemTotalWeightKg(lineWeight)
                    .available(available)
                    .stockAdjusted(false)
                    .message(available ? null : notifications.get(notifications.size() - 1))
                    .build());
        }

        BigDecimal discount = BigDecimal.ZERO;
        String appliedVoucher = null;
        if (StringUtils.hasText(voucherCode)) {
            Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim())
                    .orElseThrow(() -> new BadRequestException("Voucher code is invalid"));
            if (!voucher.isUsableAt(LocalDateTime.now(), subtotal)) {
                throw new BadRequestException("Voucher is inactive, expired, depleted, or requires a higher subtotal");
            }
            discount = voucher.getDiscountAmount().min(subtotal);
            appliedVoucher = voucher.getCode();
        }
        BigDecimal shippingFee = items.isEmpty() ? BigDecimal.ZERO
                : ("EXPRESS".equals(shippingMethod) ? EXPRESS_FEE : STANDARD_FEE);
        return CartResponseDTO.builder()
                .items(items)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discount)
                .totalCost(subtotal.subtract(discount).add(shippingFee))
                .totalWeightKg(totalWeight)
                .shippingMethod(shippingMethod)
                .voucherCode(appliedVoucher)
                .stockChanged(stockChanged)
                .totalItemsCount(totalItems)
                .notifications(notifications)
                .build();
    }

    private User requireActiveUser(String email, boolean lock) {
        if (!StringUtils.hasText(email)) throw new BadRequestException("Authenticated customer is required");
        User user = (lock ? userRepository.findByEmailForUpdate(email) : userRepository.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountLockedException("Only ACTIVE customers can use the cart");
        }
        return user;
    }

    private void requireAvailable(Product product, int quantity) {
        if (quantity < 1) throw new BadRequestException("Quantity must be at least 1");
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Product is no longer available: " + product.getName());
        }
        int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        if (quantity > stock) {
            throw new BadRequestException("Insufficient stock for " + product.getName() + ". Available: " + stock);
        }
    }
}
