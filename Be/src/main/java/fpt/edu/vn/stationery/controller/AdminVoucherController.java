package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.VoucherRequestDTO;
import fpt.edu.vn.stationery.dto.request.VoucherStatusRequestDTO;
import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.service.VoucherService;
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
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Voucher Management", description = "Admin Voucher and Coupon Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminVoucherController {

    private final VoucherService voucherService;

    @Operation(summary = "Get all vouchers with optional filters (keyword, isActive)")
    @GetMapping
    public ResponseEntity<List<VoucherResponseDTO>> getAllVouchers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive) {
        if (keyword != null || isActive != null) {
            return ResponseEntity.ok(voucherService.searchVouchers(keyword, isActive));
        }
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @Operation(summary = "Get voucher by ID")
    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponseDTO> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @Operation(summary = "Create a new voucher / coupon (Checks for unique code)")
    @PostMapping
    public ResponseEntity<VoucherResponseDTO> createVoucher(@Valid @RequestBody VoucherRequestDTO request) {
        VoucherResponseDTO created = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing voucher (Checks for unique code)")
    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponseDTO> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequestDTO request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @Operation(summary = "Delete a voucher")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Toggle voucher activation status (active <-> inactive)")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<VoucherResponseDTO> toggleVoucherStatus(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.toggleVoucherStatus(id));
    }

    @Operation(summary = "Update voucher activation status directly")
    @PutMapping("/{id}/status")
    public ResponseEntity<VoucherResponseDTO> updateVoucherStatus(
            @PathVariable Long id,
            @Valid @RequestBody VoucherStatusRequestDTO request) {
        return ResponseEntity.ok(voucherService.updateVoucherStatus(id, request.getIsActive()));
    }
}
