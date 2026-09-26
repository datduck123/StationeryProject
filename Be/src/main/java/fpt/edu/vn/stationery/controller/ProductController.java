package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Public - Product", description = "Public Product APIs")
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Get product list with pagination, search, filter and sort")
    @GetMapping
    public ResponseEntity<PageDTO<ProductResponseDTO>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false, defaultValue = "price,asc") String sort) {
        PageDTO<ProductResponseDTO> response = productService.getProducts(page, size, keyword, categoryId, brandId, sort);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get product detail by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        ProductResponseDTO response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }
}
