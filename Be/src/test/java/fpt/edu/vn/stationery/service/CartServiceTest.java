package fpt.edu.vn.stationery.service;

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
import fpt.edu.vn.stationery.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartCalculationService cartCalculationService;

    @InjectMocks
    private CartServiceImpl cartService;

    private User testUser;
    private Product activeProduct;
    private CartResponseDTO mockCartResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .email("customer@test.com")
                .fullName("Test Customer")
                .build();

        activeProduct = Product.builder()
                .productId(100L)
                .name("Thiên Long Gel Pen")
                .sku("TL-GEL-01")
                .price(BigDecimal.valueOf(12.50))
                .stock(10)
                .status(ProductStatus.ACTIVE)
                .build();

        mockCartResponse = CartResponseDTO.builder()
                .subtotal(BigDecimal.valueOf(12.50))
                .build();
    }

    @Test
    @DisplayName("Thêm sản phẩm mới vào giỏ hàng thành công khi kho đủ hàng")
    void addToCart_Success_WhenNewItem() {
        CartItemInputDTO request = CartItemInputDTO.builder()
                .productId(100L)
                .quantity(3)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUser_UserIdAndProduct_ProductId(1L, 100L)).thenReturn(Optional.empty());
        when(cartCalculationService.calculateForUser(eq(1L), anyString(), any())).thenReturn(mockCartResponse);

        CartResponseDTO response = cartService.addToCart(1L, request);

        assertNotNull(response);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Cộng dồn số lượng khi sản phẩm đã có sẵn trong giỏ hàng và không vượt quá tồn kho")
    void addToCart_Success_WhenItemAlreadyInCart() {
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(testUser)
                .product(activeProduct)
                .quantity(3)
                .build();

        CartItemInputDTO request = CartItemInputDTO.builder()
                .productId(100L)
                .quantity(4)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUser_UserIdAndProduct_ProductId(1L, 100L)).thenReturn(Optional.of(existingItem));
        when(cartCalculationService.calculateForUser(eq(1L), anyString(), any())).thenReturn(mockCartResponse);

        CartResponseDTO response = cartService.addToCart(1L, request);

        assertNotNull(response);
        assertEquals(7, existingItem.getQuantity());
        verify(cartItemRepository, times(1)).save(existingItem);
    }

    @Test
    @DisplayName("Báo lỗi khi thêm sản phẩm đã hết hàng trong kho (stock = 0)")
    void addToCart_ThrowsBadRequest_WhenStockZero() {
        activeProduct.setStock(0);

        CartItemInputDTO request = CartItemInputDTO.builder()
                .productId(100L)
                .quantity(1)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.addToCart(1L, request)
        );
        assertTrue(ex.getMessage().contains("hết hàng"));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Báo lỗi khi số lượng yêu cầu thêm vượt quá tồn kho hiện tại")
    void addToCart_ThrowsBadRequest_WhenRequestedQtyExceedsStock() {
        CartItemInputDTO request = CartItemInputDTO.builder()
                .productId(100L)
                .quantity(15) // stock = 10
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUser_UserIdAndProduct_ProductId(1L, 100L)).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.addToCart(1L, request)
        );
        assertTrue(ex.getMessage().contains("vượt quá tồn kho"));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Báo lỗi khi cộng dồn số lượng vượt quá tồn kho")
    void addToCart_ThrowsBadRequest_WhenAccumulatedQtyExceedsStock() {
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(testUser)
                .product(activeProduct)
                .quantity(8)
                .build();

        CartItemInputDTO request = CartItemInputDTO.builder()
                .productId(100L)
                .quantity(5) // 8 + 5 = 13 > stock 10
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(activeProduct));
        when(cartItemRepository.findByUser_UserIdAndProduct_ProductId(1L, 100L)).thenReturn(Optional.of(existingItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.addToCart(1L, request)
        );
        assertTrue(ex.getMessage().contains("vượt quá tồn kho"));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cập nhật số lượng (+/-) thành công")
    void updateCartItem_Success() {
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(testUser)
                .product(activeProduct)
                .quantity(3)
                .build();

        when(cartItemRepository.findById(10L)).thenReturn(Optional.of(existingItem));
        when(cartCalculationService.calculateForUser(eq(1L), anyString(), any())).thenReturn(mockCartResponse);

        CartResponseDTO response = cartService.updateCartItem(1L, 10L, 5);

        assertNotNull(response);
        assertEquals(5, existingItem.getQuantity());
        verify(cartItemRepository, times(1)).save(existingItem);
    }

    @Test
    @DisplayName("Báo lỗi khi cập nhật số lượng vượt quá tồn kho")
    void updateCartItem_ThrowsBadRequest_WhenQtyExceedsStock() {
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(testUser)
                .product(activeProduct)
                .quantity(3)
                .build();

        when(cartItemRepository.findById(10L)).thenReturn(Optional.of(existingItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.updateCartItem(1L, 10L, 20) // stock = 10
        );
        assertTrue(ex.getMessage().contains("vượt quá tồn kho"));
    }

    @Test
    @DisplayName("Báo lỗi khi cập nhật mục giỏ hàng không thuộc về người dùng")
    void updateCartItem_ThrowsBadRequest_WhenItemNotBelongToUser() {
        User otherUser = User.builder().userId(99L).build();
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(otherUser)
                .product(activeProduct)
                .quantity(3)
                .build();

        when(cartItemRepository.findById(10L)).thenReturn(Optional.of(existingItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.updateCartItem(1L, 10L, 5)
        );
        assertTrue(ex.getMessage().contains("không có quyền"));
    }

    @Test
    @DisplayName("Xóa một sản phẩm khỏi giỏ hàng thành công")
    void removeCartItem_Success() {
        CartItem existingItem = CartItem.builder()
                .cartItemId(10L)
                .user(testUser)
                .product(activeProduct)
                .quantity(3)
                .build();

        when(cartItemRepository.findById(10L)).thenReturn(Optional.of(existingItem));
        when(cartCalculationService.calculateForUser(eq(1L), anyString(), any())).thenReturn(mockCartResponse);

        CartResponseDTO response = cartService.removeCartItem(1L, 10L);

        assertNotNull(response);
        verify(cartItemRepository, times(1)).delete(existingItem);
    }

    @Test
    @DisplayName("Xóa toàn bộ giỏ hàng thành công")
    void clearCart_Success() {
        when(cartCalculationService.calculateForUser(eq(1L), anyString(), any())).thenReturn(mockCartResponse);

        CartResponseDTO response = cartService.clearCart(1L);

        assertNotNull(response);
        verify(cartItemRepository, times(1)).deleteByUser_UserId(1L);
    }
}
