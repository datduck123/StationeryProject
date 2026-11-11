package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.VoucherRequestDTO;
import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {

    VoucherResponseDTO createVoucher(VoucherRequestDTO request);

    VoucherResponseDTO updateVoucher(Long id, VoucherRequestDTO request);

    void deleteVoucher(Long id);

    VoucherResponseDTO getVoucherById(Long id);

    VoucherResponseDTO getVoucherByCode(String code);

    List<VoucherResponseDTO> getAllVouchers();

    List<VoucherResponseDTO> getActiveVouchers();

    List<VoucherResponseDTO> searchVouchers(String keyword, Boolean isActive);

    VoucherResponseDTO toggleVoucherStatus(Long id);

    VoucherResponseDTO updateVoucherStatus(Long id, Boolean isActive);

    VoucherResponseDTO validateVoucher(String code, BigDecimal orderAmount);

    BigDecimal calculateDiscount(Long voucherId, BigDecimal subtotal);
}
