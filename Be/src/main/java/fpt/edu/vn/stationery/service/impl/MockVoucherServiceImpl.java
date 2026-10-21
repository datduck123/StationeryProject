package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.service.VoucherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Mock implementation of VoucherService.
 * To be replaced by the actual Voucher module implemented by Member 5.
 */
@Service
@Slf4j
public class MockVoucherServiceImpl implements VoucherService {

    @Override
    public BigDecimal calculateDiscount(Long voucherId, BigDecimal subtotal) {
        if (voucherId == null || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        log.info("MockVoucherService: Validating voucher ID {} for subtotal {}", voucherId, subtotal);

        // Mock logic for testing
        // Voucher ID 1: 10% off (max 50), min order 100
        if (voucherId == 1L) {
            BigDecimal minOrder = BigDecimal.valueOf(100);
            if (subtotal.compareTo(minOrder) < 0) {
                throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + minOrder + " để áp dụng mã giảm giá này.");
            }
            BigDecimal discount = subtotal.multiply(BigDecimal.valueOf(0.10));
            BigDecimal maxDiscount = BigDecimal.valueOf(50);
            if (discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
            return discount.setScale(2, RoundingMode.HALF_UP);
        }

        // Voucher ID 2: $15 off, min order 50
        if (voucherId == 2L) {
            BigDecimal minOrder = BigDecimal.valueOf(50);
            if (subtotal.compareTo(minOrder) < 0) {
                throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + minOrder + " để áp dụng mã giảm giá này.");
            }
            return BigDecimal.valueOf(15.00).setScale(2, RoundingMode.HALF_UP);
        }

        throw new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
}
