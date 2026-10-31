package fpt.edu.vn.stationery.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateStockRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandSummaryDTO;
import fpt.edu.vn.stationery.dto.response.CategorySummaryDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    private ProductRequestDTO validRequest;
    private ProductResponseDTO sampleResponse;

    @BeforeEach
    void setUp() {
        validRequest = ProductRequestDTO.builder()
                .name("Highlighter Pen")
                .sku("HL-001")
                .price(new BigDecimal("12000.00"))
                .weightKg(new BigDecimal("0.050"))
                .stockQuantity(100)
                .categoryId(1L)
                .brandId(1L)
                .description("Fluorescent yellow highlighter")
                .imageUrl("https://example.com/hl.jpg")
                .status(ProductStatus.ACTIVE)
                .build();

        sampleResponse = ProductResponseDTO.builder()
                .productId(1L)
                .sku("HL-001")
                .name("Highlighter Pen")
                .price(new BigDecimal("12000.00"))
                .stockQuantity(100)
                .description("Fluorescent yellow highlighter")
                .imageUrl("https://example.com/hl.jpg")
                .status(ProductStatus.ACTIVE)
                .category(CategorySummaryDTO.builder().categoryId(1L).name("Pens").build())
                .brand(BrandSummaryDTO.builder().brandId(1L).name("Thien Long").build())
                .build();
    }

    // 1. Create Success with ADMIN role
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("1. POST /api/admin/products: Success (201 Created)")
    void testCreateProduct_Success() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("HL-001"))
                .andExpect(jsonPath("$.name").value("Highlighter Pen"));
    }

    // 2. Duplicate SKU (409 Conflict)
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("2. POST /api/admin/products: Duplicate SKU (409 Conflict)")
    void testCreateProduct_DuplicateSku() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class)))
                .thenThrow(new DuplicateResourceException("Product with SKU 'HL-001' already exists"));

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Product with SKU 'HL-001' already exists"));
    }

    // 3. Invalid Price (< 0) -> 400 Bad Request
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("3. POST /api/admin/products: Invalid Price (< 0) -> 400 Bad Request")
    void testCreateProduct_InvalidPrice() throws Exception {
        ProductRequestDTO invalidRequest = ProductRequestDTO.builder()
                .name("Highlighter Pen")
                .sku("HL-002")
                .price(new BigDecimal("-1000.00")) // Invalid
                .stockQuantity(10)
                .categoryId(1L)
                .brandId(1L)
                .build();

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.price").exists());
    }

    // 4. Invalid Stock (< 0) -> 400 Bad Request
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("4. POST /api/admin/products: Invalid Stock (< 0) -> 400 Bad Request")
    void testCreateProduct_InvalidStock() throws Exception {
        ProductRequestDTO invalidRequest = ProductRequestDTO.builder()
                .name("Highlighter Pen")
                .sku("HL-003")
                .price(new BigDecimal("10000.00"))
                .stockQuantity(-5) // Invalid
                .categoryId(1L)
                .brandId(1L)
                .build();

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.stockQuantity").exists());
    }

    // 5. Invalid Category -> 404 Not Found
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("5. POST /api/admin/products: Invalid Category -> 404 Not Found")
    void testCreateProduct_InvalidCategory() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Category not found with id: 999"));

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Category not found with id: 999"));
    }

    // 6. Invalid Brand -> 404 Not Found
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("6. POST /api/admin/products: Invalid Brand -> 404 Not Found")
    void testCreateProduct_InvalidBrand() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Brand not found with id: 999"));

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Brand not found with id: 999"));
    }

    // 7. Update Success (200 OK)
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("7. PUT /api/admin/products/{id}: Update Success (200 OK)")
    void testUpdateProduct_Success() throws Exception {
        when(productService.updateProduct(eq(1L), any(ProductRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(put("/api/admin/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1L));
    }

    // 8. Delete Success (204 No Content)
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("8. DELETE /api/admin/products/{id}: Delete Success (204 No Content)")
    void testDeleteProduct_Success() throws Exception {
        doNothing().when(productService).deleteProduct(1L);

        mockMvc.perform(delete("/api/admin/products/1"))
                .andExpect(status().isNoContent());

        verify(productService).deleteProduct(1L);
    }

    // 9. Product Not Found (404 Not Found)
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("9. GET /api/admin/products/{id}: Not Found (404)")
    void testGetProduct_NotFound() throws Exception {
        when(productService.getProductByIdAdmin(999L))
                .thenThrow(new ResourceNotFoundException("Product not found with id: 999"));

        mockMvc.perform(get("/api/admin/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // 10. Unauthorized (no auth token -> 401 or 403)
    @Test
    @DisplayName("10. POST /api/admin/products: Unauthorized when unauthenticated")
    void testCreateProduct_Unauthorized() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isUnauthorized());
    }

    // 11. Forbidden (CUSTOMER role -> 403 Forbidden)
    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("11. POST /api/admin/products: Forbidden for non-admin role (403)")
    void testCreateProduct_Forbidden() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isForbidden());
    }

    // 12. Update Stock Success (200 OK)
    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("12. PATCH /api/admin/products/{id}/stock: Update Stock Success (200 OK)")
    void testUpdateStock_Success() throws Exception {
        UpdateStockRequestDTO stockRequest = UpdateStockRequestDTO.builder().stockQuantity(300).build();
        when(productService.updateStock(eq(1L), any(UpdateStockRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/admin/products/1/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockRequest)))
                .andExpect(status().isOk());
    }
}

