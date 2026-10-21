package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Vouchers", description = "Public voucher catalogue")
public class VoucherController {
    private final VoucherService voucherService;

    @Operation(summary = "List vouchers that are active, in date, and not depleted")
    @GetMapping("/active")
    public ResponseEntity<List<VoucherResponseDTO>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }
}
