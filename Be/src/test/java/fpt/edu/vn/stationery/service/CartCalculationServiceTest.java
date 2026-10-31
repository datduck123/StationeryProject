package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartItemResponseDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.CartItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.CartStockConflictException;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.impl.CartCalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartCalculationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @InjectMocks
    private CartCalculationServiceImpl cartCalculationService;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        product1 = Product.builder()
                .productId(1L)
                .name("Thiên Long Ballpoint Pen")
                .sku("TL-PEN-01")
                .price(BigDecimal.valueOf(10.00))
                .stockQuantity(20)
                .status(ProductStatus.ACTIVE)
                .build();

        product2 = Product.builder()
                .productId(2L)
                .name("Campus Notebook 200p")
                .sku("NB-CAMPUS-02")
                .price(BigDecimal.valueOf(25.00))
                .stockQuantity(5)
                .status(ProductStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Tồn kho đáp ứng đủ: giữ nguyên số lượng và tính tạm tính, phí ship chính xác")
    void calculate_whenStockSufficient_shouldCalculateAccurately() {
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product1, product2));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(
                        CartItemInputDTO.builder().productId(1L).quantity(2).build(), // 2 * 10 = 20
                        CartItemInputDTO.builder().productId(2L).quantity(2).build()  // 2 * 25 = 50
                ))
                .shippingMethod("STANDARD")
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, null);

        assertNotNull(result);
        assertFalse(result.isStockChanged());
        assertEquals(0, BigDecimal.valueOf(70.00).compareTo(result.getSubtotal()));
        assertEquals(0, BigDecimal.valueOf(5.00).compareTo(result.getShippingFee())); // Dưới 100 -> ship 5$
        assertEquals(0, BigDecimal.valueOf(75.00).compareTo(result.getTotalCost()));
        assertEquals(4, result.getTotalItemsCount());
        assertEquals(2, result.getItems().size());

        CartItemResponseDTO item1 = result.getItems().get(0);
        assertEquals(2, item1.getRequestedQuantity());
        assertEquals(2, item1.getFinalQuantity());
        assertFalse(item1.isStockAdjusted());
        assertTrue(item1.isAvailable());
    }

    @Test
    @DisplayName("Tồn kho giảm xuống thấp hơn số lượng yêu cầu: tự động trừ/giảm số lượng và cảnh báo")
    void calculate_whenRequestedQuantityExceedsStock_shouldAutoAdjustQuantity() {
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product2)); // stock = 5

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(
                        CartItemInputDTO.builder().productId(2L).quantity(10).build() // yêu cầu 10 nhưng kho chỉ có 5
                ))
                .shippingMethod("STANDARD")
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, null);

        assertNotNull(result);
        assertTrue(result.isStockChanged(), "Phải đánh dấu cờ stockChanged = true");
        assertEquals(1, result.getNotifications().size());
        assertTrue(result.getNotifications().get(0).contains("tự động giảm từ 10 xuống 5"));

        CartItemResponseDTO item = result.getItems().get(0);
        assertEquals(10, item.getRequestedQuantity());
        assertEquals(5, item.getFinalQuantity());
        assertTrue(item.isStockAdjusted());
        assertEquals(0, BigDecimal.valueOf(125.00).compareTo(result.getSubtotal())); // 5 * 25 = 125
        assertEquals(0, BigDecimal.ZERO.compareTo(result.getShippingFee())); // 125 >= 100 -> freeship!
        assertEquals(0, BigDecimal.valueOf(125.00).compareTo(result.getTotalCost()));
    }

    @Test
    @DisplayName("Sản phẩm hết hàng: tự động chuyển số lượng về 0 và đánh dấu không khả dụng")
    void calculate_whenProductOutOfStock_shouldSetQuantityZeroAndUnavailable() {
        product2.setStockQuantity(0);
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product2));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(
                        CartItemInputDTO.builder().productId(2L).quantity(3).build()
                ))
                .shippingMethod("STANDARD")
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, null);

        assertNotNull(result);
        assertTrue(result.isStockChanged());
        CartItemResponseDTO item = result.getItems().get(0);
        assertEquals(0, item.getFinalQuantity());
        assertFalse(item.isAvailable());
        assertTrue(item.isStockAdjusted());
        assertEquals(0, BigDecimal.ZERO.compareTo(result.getSubtotal()));
        assertEquals(0, BigDecimal.ZERO.compareTo(result.getTotalCost()));
    }

    @Test
    @DisplayName("Sản phẩm ngừng kinh doanh (INACTIVE): tự động loại khỏi đơn hàng")
    void calculate_whenProductInactive_shouldSetQuantityZeroAndUnavailable() {
        product1.setStatus(ProductStatus.INACTIVE);
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product1));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(
                        CartItemInputDTO.builder().productId(1L).quantity(2).build()
                ))
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, null);

        assertTrue(result.isStockChanged());
        CartItemResponseDTO item = result.getItems().get(0);
        assertEquals(0, item.getFinalQuantity());
        assertFalse(item.isAvailable());
    }

    @Test
    @DisplayName("Phương thức giao hàng EXPRESS: tính cước 15.00")
    void calculate_whenExpressShipping_shouldApplyExpressBaseFee() {
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product1));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(CartItemInputDTO.builder().productId(1L).quantity(1).build()))
                .shippingMethod("EXPRESS")
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, null);

        assertEquals(0, BigDecimal.valueOf(15.00).compareTo(result.getShippingFee()));
        assertEquals(0, BigDecimal.valueOf(25.00).compareTo(result.getTotalCost())); // 10 subtotal + 15 fee
    }

    @Test
    @DisplayName("User đã đăng nhập: tự động đồng bộ số lượng trong DB CartItems khi kho thay đổi")
    void calculate_whenUserLoggedIn_shouldSyncDbCartItem() {
        User user = User.builder().userId(99L).build();
        CartItem dbCartItem = CartItem.builder()
                .cartItemId(101L)
                .user(user)
                .product(product2)
                .quantity(8)
                .build();

        when(productRepository.findAllById(anySet())).thenReturn(List.of(product2)); // stock = 5
        when(cartItemRepository.findByUser_UserId(99L)).thenReturn(List.of(dbCartItem));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(CartItemInputDTO.builder().productId(2L).quantity(8).build()))
                .build();

        CartResponseDTO result = cartCalculationService.calculate(request, 99L);

        assertTrue(result.isStockChanged());
        // Verify đã cập nhật số lượng trong DB về tồn kho thực tế (5)
        verify(cartItemRepository).save(argThat(item -> item.getQuantity() == 5));
    }

    @Test
    @DisplayName("Hàm chung Checkout: ném ngoại lệ CartStockConflictException nếu kho thay đổi")
    void validateAndCalculateForCheckout_whenStockChanged_shouldThrowConflictException() {
        product2.setStockQuantity(3);
        when(productRepository.findAllById(anySet())).thenReturn(List.of(product2));

        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(CartItemInputDTO.builder().productId(2L).quantity(5).build()))
                .shippingMethod("STANDARD")
                .build();

        CartStockConflictException exception = assertThrows(CartStockConflictException.class, () ->
                cartCalculationService.validateAndCalculateForCheckout(request, null));

        assertNotNull(exception.getCartResponse());
        assertTrue(exception.getCartResponse().isStockChanged());
    }

    @Test
    @DisplayName("Hàm chung Checkout: ném BadRequestException nếu không có sản phẩm hợp lệ")
    void validateAndCalculateForCheckout_whenEmptyCart_shouldThrowBadRequestException() {
        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(Collections.emptyList())
                .build();

        assertThrows(BadRequestException.class, () ->
                cartCalculationService.validateAndCalculateForCheckout(request, null));
    }

    @Test
    @DisplayName("Phương thức vận chuyển không hợp lệ phải ném BadRequestException")
    void calculate_whenInvalidShippingMethod_shouldThrowBadRequestException() {
        CartCalculationRequestDTO request = CartCalculationRequestDTO.builder()
                .items(List.of(CartItemInputDTO.builder().productId(1L).quantity(1).build()))
                .shippingMethod("TELEPORT")
                .build();

        assertThrows(BadRequestException.class, () ->
                cartCalculationService.calculate(request, null));
    }
}
