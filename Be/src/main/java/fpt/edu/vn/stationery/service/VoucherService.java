package fpt.edu.vn.stationery.service;

import java.math.BigDecimal;

public interface VoucherService {
    
    /**
     * Validates a voucher against the order subtotal and calculates the discount amount.
     * @param voucherId The ID of the voucher to apply.
     * @param subtotal The subtotal of the cart.
     * @return The discount amount in BigDecimal.
     * @throws fpt.edu.vn.stationery.exception.BadRequestException if the voucher is invalid or the subtotal does not meet the minimum requirement.
     */
    BigDecimal calculateDiscount(Long voucherId, BigDecimal subtotal);
}
