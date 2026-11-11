package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.CartItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.CartCalculationService;
import fpt.edu.vn.stationery.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartCalculationService cartCalculationService;

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(Long userId, String shippingMethod, Long voucherId) {
        validateUserId(userId);
        return cartCalculationService.calculateForUser(userId, shippingMethod, voucherId);
    }

    @Override
    @Transactional
    public CartResponseDTO addToCart(Long userId, CartItemInputDTO request) {
        validateUserId(userId);
        if (request == null || request.getProductId() == null) {
            throw new BadRequestException("Thông tin sản phẩm không được để trống");
        }
        int quantityToAdd = (request.getQuantity() != null && request.getQuantity() > 0)
                ? request.getQuantity() : 1;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Sản phẩm hiện đang ngừng kinh doanh");
        }

        int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        if (availableStock <= 0) {
            throw new BadRequestException("Sản phẩm đã hết hàng trong kho");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUser_UserIdAndProduct_ProductId(userId, product.getProductId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + quantityToAdd;
            if (newQuantity > availableStock) {
                throw new BadRequestException("Tổng số lượng (" + newQuantity + ") vượt quá tồn kho hiện có (" + availableStock + ")");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (quantityToAdd > availableStock) {
                throw new BadRequestException("Số lượng yêu cầu (" + quantityToAdd + ") vượt quá tồn kho hiện có (" + availableStock + ")");
            }
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantityToAdd)
                    .build();
            cartItemRepository.save(newItem);
        }

        return cartCalculationService.calculateForUser(userId, "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        validateUserId(userId);
        if (cartItemId == null) {
            throw new BadRequestException("ID mục giỏ hàng không được để trống");
        }
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn hoặc bằng 1");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mục trong giỏ hàng với ID: " + cartItemId));

        if (!cartItem.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền thao tác trên mục giỏ hàng này");
        }

        Product product = cartItem.getProduct();
        if (product == null || product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Sản phẩm hiện đang ngừng kinh doanh");
        }

        int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        if (quantity > availableStock) {
            throw new BadRequestException("Số lượng yêu cầu (" + quantity + ") vượt quá tồn kho hiện có (" + availableStock + ")");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return cartCalculationService.calculateForUser(userId, "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO removeCartItem(Long userId, Long cartItemId) {
        validateUserId(userId);
        if (cartItemId == null) {
            throw new BadRequestException("ID mục giỏ hàng không được để trống");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mục trong giỏ hàng với ID: " + cartItemId));

        if (!cartItem.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền thao tác trên mục giỏ hàng này");
        }

        cartItemRepository.delete(cartItem);

        return cartCalculationService.calculateForUser(userId, "STANDARD", null);
    }

    @Override
    @Transactional
    public CartResponseDTO clearCart(Long userId) {
        validateUserId(userId);
        cartItemRepository.deleteByUser_UserId(userId);
        return cartCalculationService.calculateForUser(userId, "STANDARD", null);
    }

    private void validateUserId(Long userId) {
        if (userId == null) {
            throw new BadRequestException("Người dùng chưa được xác thực hoặc không tìm thấy tài khoản");
        }
    }
}
