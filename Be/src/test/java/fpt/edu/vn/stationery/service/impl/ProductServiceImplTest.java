package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.response.BrandSummaryDTO;
import fpt.edu.vn.stationery.dto.response.CategorySummaryDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateStockRequestDTO;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.ProductMapper;
import fpt.edu.vn.stationery.repository.BrandRepository;
import fpt.edu.vn.stationery.repository.CategoryRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product activeProduct;
    private Product inactiveProduct;
    private ProductResponseDTO productResponseDTO;
    private Category category;
    private Brand brand;

    @BeforeEach
    void setUp() {
        category = Category.builder().categoryId(1L).name("Pens and Pencils").build();
        brand = Brand.builder().brandId(1L).name("Thien Long").build();

        activeProduct = Product.builder()
                .productId(1L)
                .category(category)
                .brand(brand)
                .sku("TL-GEL01")
                .name("Gel Pen 0.5mm")
                .price(new BigDecimal("15000.00"))
                .weightKg(new BigDecimal("0.020"))
                .stockQuantity(100)
                .description("Smooth blue gel pen")
                .imageUrl("https://example.com/gel-pen.jpg")
                .status(ProductStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        inactiveProduct = Product.builder()
                .productId(2L)
                .category(category)
                .brand(brand)
                .sku("TL-HIDDEN")
                .name("Hidden Pen")
                .price(new BigDecimal("20000.00"))
                .weightKg(new BigDecimal("0.025"))
                .stockQuantity(0)
                .description("Inactive item")
                .status(ProductStatus.INACTIVE)
                .build();

        CategorySummaryDTO catDto = CategorySummaryDTO.builder().categoryId(1L).name("Pens and Pencils").build();
        BrandSummaryDTO brandDto = BrandSummaryDTO.builder().brandId(1L).name("Thien Long").build();

        productResponseDTO = ProductResponseDTO.builder()
                .productId(1L)
                .sku("TL-GEL01")
                .name("Gel Pen 0.5mm")
                .price(new BigDecimal("15000.00"))
                .weightKg(new BigDecimal("0.020"))
                .stockQuantity(100)
                .description("Smooth blue gel pen")
                .imageUrl("https://example.com/gel-pen.jpg")
                .category(catDto)
                .brand(brandDto)
                .status(ProductStatus.ACTIVE)
                .build();
    }

    // 1. Pagination Test
    @Test
    @DisplayName("1. Pagination: retrieves correct page content and metadata")
    void testPagination() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 10, null, null, null, null, null, null);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(0, result.getPageNumber());
        assertEquals(1, result.getPageSize());
        assertEquals(1L, result.getTotalElements());
    }

    // 2. Keyword Search Test
    @Test
    @DisplayName("2. Keyword Search: passes search query in specification")
    void testKeywordSearch() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 12, "Gel Pen", null, null, null, null, "price,asc");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    // 3. Category Filter Test
    @Test
    @DisplayName("3. Category Filter: filters products by categoryId")
    void testCategoryFilter() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 12, null, 1L, null, null, null, "price,asc");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    // 4. Brand Filter Test
    @Test
    @DisplayName("4. Brand Filter: filters products by brandId")
    void testBrandFilter() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 12, null, null, 1L, null, null, "price,asc");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    // 5. Price Ascending Sort Test
    @Test
    @DisplayName("5. Price Ascending: passes ascending sort on price")
    void testPriceAscending() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(productRepository.findAll(any(Specification.class), pageableCaptor.capture())).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        productService.getProducts(0, 10, null, null, null, null, null, "price,asc");

        Pageable capturedPageable = pageableCaptor.getValue();
        Sort.Order order = capturedPageable.getSort().getOrderFor("price");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }

    // 6. Price Descending Sort Test
    @Test
    @DisplayName("6. Price Descending: passes descending sort on price")
    void testPriceDescending() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(productRepository.findAll(any(Specification.class), pageableCaptor.capture())).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        productService.getProducts(0, 10, null, null, null, null, null, "price,desc");

        Pageable capturedPageable = pageableCaptor.getValue();
        Sort.Order order = capturedPageable.getSort().getOrderFor("price");
        assertNotNull(order);
        assertTrue(order.isDescending());
    }

    // 7. Combined Filters Test
    @Test
    @DisplayName("7. Combined Filters: combines keyword, category, brand and sort")
    void testCombinedFilters() {
        Page<Product> page = new PageImpl<>(List.of(activeProduct));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(productRepository.findAll(any(Specification.class), pageableCaptor.capture())).thenReturn(page);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 5, "gel", 1L, 1L, null, null, "price,desc");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        Pageable capturedPageable = pageableCaptor.getValue();
        assertEquals(5, capturedPageable.getPageSize());
        assertEquals(0, capturedPageable.getPageNumber());
        assertTrue(capturedPageable.getSort().getOrderFor("price").isDescending());
    }

    // 8. Empty Result Test
    @Test
    @DisplayName("8. Empty Result: returns valid PageDTO with empty list and zero totals")
    void testEmptyResult() {
        Page<Product> emptyPage = new PageImpl<>(Collections.emptyList(), org.springframework.data.domain.PageRequest.of(0, 10), 0);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        PageDTO<ProductResponseDTO> result = productService.getProducts(0, 10, "NonExistentProduct", null, null, null, null, "price,asc");

        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());
        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getTotalPages());
    }

    // 9. Invalid Parameter Test
    @Test
    @DisplayName("9. Invalid Parameter: throws BadRequestException for invalid pagination, sorting, or IDs")
    void testInvalidParameter() {
        // Negative page
        assertThrows(BadRequestException.class, () -> productService.getProducts(-1, 10, null, null, null, null, null, "price,asc"));
        // Non-positive size
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 0, null, null, null, null, null, "price,asc"));
        // Size > 100
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 101, null, null, null, null, null, "price,asc"));
        // Invalid categoryId <= 0
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, -1L, null, null, null, "price,asc"));
        // Invalid brandId <= 0
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, null, -2L, null, null, "price,asc"));
        // Invalid sort field
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, null, null, null, null, "unknownField,asc"));
        // Invalid sort direction
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, null, null, null, null, "price,diagonal"));
        // Negative minPrice
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, null, null, new BigDecimal("-1"), null, "price,asc"));
        // minPrice > maxPrice
        assertThrows(BadRequestException.class, () -> productService.getProducts(0, 10, null, null, null, new BigDecimal("500"), new BigDecimal("100"), "price,asc"));
        // Invalid product ID for detail
        assertThrows(BadRequestException.class, () -> productService.getProductById(0L));
        assertThrows(BadRequestException.class, () -> productService.getProductById(-10L));
    }

    // 10. Product Detail Found Test
    @Test
    @DisplayName("10. Product Detail Found: returns complete product information")
    void testProductDetailFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        ProductResponseDTO result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals(1L, result.getId());
        assertEquals("TL-GEL01", result.getSku());
        assertEquals("Gel Pen 0.5mm", result.getName());
        assertEquals(new BigDecimal("15000.00"), result.getPrice());
        assertEquals(100, result.getStock());
        assertEquals(100, result.getStockQuantity());
        assertEquals("Smooth blue gel pen", result.getDescription());
        assertEquals(List.of("https://example.com/gel-pen.jpg"), result.getImages());
        assertNotNull(result.getCategory());
        assertEquals(1L, result.getCategory().getCategoryId());
        assertNotNull(result.getBrand());
        assertEquals(1L, result.getBrand().getBrandId());
        assertEquals(ProductStatus.ACTIVE, result.getStatus());
    }

    // 11. Product Detail Not Found Test
    @Test
    @DisplayName("11. Product Detail Not Found: throws ResourceNotFoundException")
    void testProductDetailNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    // 12. Hidden/Inactive Product Test
    @Test
    @DisplayName("12. Hidden/Inactive Product: throws ResourceNotFoundException on detail")
    void testHiddenInactiveProduct() {
        when(productRepository.findById(2L)).thenReturn(Optional.of(inactiveProduct));

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(2L));
    }

    // 13. Admin: Create Product Success
    @Test
    @DisplayName("13. Admin Create Product Success")
    void testCreateProduct_Success() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("New Notebook")
                .sku("NB-001")
                .price(new BigDecimal("25000.00"))
                .weightKg(new BigDecimal("0.200"))
                .stockQuantity(50)
                .categoryId(1L)
                .brandId(1L)
                .description("High quality notebook")
                .imageUrl("https://example.com/nb.jpg")
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.existsBySku("NB-001")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(brandRepository.findById(1L)).thenReturn(Optional.of(brand));
        when(productMapper.toEntity(request)).thenReturn(activeProduct);
        when(productRepository.save(any(Product.class))).thenReturn(activeProduct);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        ProductResponseDTO result = productService.createProduct(request);

        assertNotNull(result);
        assertEquals("TL-GEL01", result.getSku());
        verify(productRepository).save(any(Product.class));
    }

    // 14. Admin: Create Product Duplicate SKU
    @Test
    @DisplayName("14. Admin Create Product: throws DuplicateResourceException on duplicate SKU")
    void testCreateProduct_DuplicateSku() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("New Notebook")
                .sku("TL-GEL01")
                .price(new BigDecimal("25000.00"))
                .stockQuantity(50)
                .categoryId(1L)
                .brandId(1L)
                .build();

        when(productRepository.existsBySku("TL-GEL01")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    // 15. Admin: Create Product Invalid Category
    @Test
    @DisplayName("15. Admin Create Product: throws ResourceNotFoundException on non-existent category")
    void testCreateProduct_InvalidCategory() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("New Notebook")
                .sku("NB-999")
                .price(new BigDecimal("25000.00"))
                .stockQuantity(50)
                .categoryId(999L)
                .brandId(1L)
                .build();

        when(productRepository.existsBySku("NB-999")).thenReturn(false);
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    // 16. Admin: Create Product Invalid Brand
    @Test
    @DisplayName("16. Admin Create Product: throws ResourceNotFoundException on non-existent brand")
    void testCreateProduct_InvalidBrand() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("New Notebook")
                .sku("NB-999")
                .price(new BigDecimal("25000.00"))
                .stockQuantity(50)
                .categoryId(1L)
                .brandId(999L)
                .build();

        when(productRepository.existsBySku("NB-999")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(brandRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    // 17. Admin: Update Product Success
    @Test
    @DisplayName("17. Admin Update Product Success")
    void testUpdateProduct_Success() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("Updated Gel Pen")
                .sku("TL-GEL01")
                .price(new BigDecimal("18000.00"))
                .stockQuantity(120)
                .categoryId(1L)
                .brandId(1L)
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.existsBySkuAndProductIdNot("TL-GEL01", 1L)).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(brandRepository.findById(1L)).thenReturn(Optional.of(brand));
        when(productRepository.save(activeProduct)).thenReturn(activeProduct);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        ProductResponseDTO result = productService.updateProduct(1L, request);

        assertNotNull(result);
        verify(productMapper).updateEntity(activeProduct, request);
        verify(productRepository).save(activeProduct);
    }

    // 18. Admin: Update Product Duplicate SKU
    @Test
    @DisplayName("18. Admin Update Product: throws DuplicateResourceException on duplicate SKU with another product")
    void testUpdateProduct_DuplicateSku() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("Updated Gel Pen")
                .sku("TL-OTHER")
                .price(new BigDecimal("18000.00"))
                .stockQuantity(120)
                .categoryId(1L)
                .brandId(1L)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.existsBySkuAndProductIdNot("TL-OTHER", 1L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> productService.updateProduct(1L, request));
        verify(productRepository, never()).save(any());
    }

    // 19. Admin: Update Product Not Found
    @Test
    @DisplayName("19. Admin Update Product: throws ResourceNotFoundException when product does not exist")
    void testUpdateProduct_NotFound() {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .name("Updated Gel Pen")
                .sku("TL-GEL01")
                .price(new BigDecimal("18000.00"))
                .stockQuantity(120)
                .categoryId(1L)
                .brandId(1L)
                .build();

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.updateProduct(999L, request));
    }

    // 20. Admin: Delete Product Success
    @Test
    @DisplayName("20. Admin Delete Product Success")
    void testDeleteProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.countOrderItemsByProductId(1L)).thenReturn(0L);
        when(productRepository.countCartItemsByProductId(1L)).thenReturn(0L);

        productService.deleteProduct(1L);

        verify(productRepository).delete(activeProduct);
    }

    // 21. Admin: Delete Product Not Found
    @Test
    @DisplayName("21. Admin Delete Product: throws ResourceNotFoundException when product does not exist")
    void testDeleteProduct_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.deleteProduct(999L));
        verify(productRepository, never()).delete(any(Product.class));
    }

    // 22. Admin: Delete Product Referenced By Orders
    @Test
    @DisplayName("22. Admin Delete Product: throws BadRequestException when product is referenced by orders")
    void testDeleteProduct_ReferencedByOrders() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.countOrderItemsByProductId(1L)).thenReturn(3L);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> productService.deleteProduct(1L));
        assertTrue(ex.getMessage().contains("orders"));
        verify(productRepository, never()).delete(any(Product.class));
    }

    // 23. Admin: Delete Product Referenced By Carts
    @Test
    @DisplayName("23. Admin Delete Product: throws BadRequestException when product is referenced by carts")
    void testDeleteProduct_ReferencedByCarts() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.countOrderItemsByProductId(1L)).thenReturn(0L);
        when(productRepository.countCartItemsByProductId(1L)).thenReturn(2L);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> productService.deleteProduct(1L));
        assertTrue(ex.getMessage().contains("carts"));
        verify(productRepository, never()).delete(any(Product.class));
    }

    // 24. Admin: Update Stock Success
    @Test
    @DisplayName("24. Admin Update Stock Success")
    void testUpdateStock_Success() {
        UpdateStockRequestDTO stockRequest = UpdateStockRequestDTO.builder().stockQuantity(250).build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.save(activeProduct)).thenReturn(activeProduct);
        when(productMapper.toDto(activeProduct)).thenReturn(productResponseDTO);

        ProductResponseDTO result = productService.updateStock(1L, stockRequest);

        assertNotNull(result);
        assertEquals(250, activeProduct.getStockQuantity());
        verify(productRepository).save(activeProduct);
    }

    // 25. Admin: Get Product By ID (including INACTIVE)
    @Test
    @DisplayName("25. Admin Get Product By ID: returns product even if INACTIVE")
    void testGetProductByIdAdmin_InactiveProduct() {
        when(productRepository.findById(2L)).thenReturn(Optional.of(inactiveProduct));
        when(productMapper.toDto(inactiveProduct)).thenReturn(productResponseDTO);

        ProductResponseDTO result = productService.getProductByIdAdmin(2L);

        assertNotNull(result);
        verify(productRepository).findById(2L);
    }
}
