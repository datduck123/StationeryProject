package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Brand Management", description = "Admin Brand Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminBrandController {

    private final BrandService brandService;

    @Operation(summary = "Get all brands (Admin)")
    @GetMapping
    public ResponseEntity<List<BrandResponseDTO>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @Operation(summary = "Create brand")
    @PostMapping
    public ResponseEntity<BrandResponseDTO> createBrand(@Valid @RequestBody BrandRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(request));
    }

    @Operation(summary = "Update brand")
    @PutMapping("/{id}")
    public ResponseEntity<BrandResponseDTO> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandRequestDTO request) {
        return ResponseEntity.ok(brandService.updateBrand(id, request));
    }

    @Operation(summary = "Delete brand")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
