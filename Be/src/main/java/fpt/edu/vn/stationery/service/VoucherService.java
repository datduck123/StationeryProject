package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;

import java.util.List;

public interface VoucherService {
    List<VoucherResponseDTO> getActiveVouchers();
}
