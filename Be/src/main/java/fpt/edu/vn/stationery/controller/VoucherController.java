package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Vouchers", description = "Public / Customer Voucher APIs")
public class VoucherController {

    private final VoucherService voucherService;

    @Operation(summary = "Get all active vouchers for customers")
    @GetMapping("/active")
    public ResponseEntity<List<VoucherResponseDTO>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.searchVouchers(null, true));
    }

    @Operation(summary = "Validate voucher code with order subtotal")
    @GetMapping("/validate")
    public ResponseEntity<VoucherResponseDTO> validateVoucher(
            @RequestParam String code,
            @RequestParam(required = false) BigDecimal orderAmount) {
        return ResponseEntity.ok(voucherService.validateVoucher(code, orderAmount));
    }
}
