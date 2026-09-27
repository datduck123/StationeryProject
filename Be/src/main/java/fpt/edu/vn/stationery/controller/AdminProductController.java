package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateStockRequestDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Product Management", description = "Admin Product Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;

    @Operation(summary = "Get paginated products for Admin (including INACTIVE)")
    @GetMapping
    public ResponseEntity<fpt.edu.vn.stationery.dto.response.PageDTO<ProductResponseDTO>> getAllProductsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(productService.getProductsAdmin(page, size, keyword, categoryId, brandId, status, sort));
    }

    @Operation(summary = "Get product by ID (Admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductByIdAdmin(id));
    }

    @Operation(summary = "Create product")
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @Operation(summary = "Update product")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @Operation(summary = "Delete product")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update product stock quantity")
    @RequestMapping(value = "/{id}/stock", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ProductResponseDTO> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequestDTO request) {
        return ResponseEntity.ok(productService.updateStock(id, request));
    }
}
