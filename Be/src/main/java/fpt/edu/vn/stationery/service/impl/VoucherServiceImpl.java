package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.entity.Voucher;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository voucherRepository;

    @Override
    public List<VoucherResponseDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findActive(now).stream().map(v -> toResponse(v, now)).toList();
    }

    private VoucherResponseDTO toResponse(Voucher voucher, LocalDateTime now) {
        return VoucherResponseDTO.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .discountAmount(voucher.getDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .status(voucher.getStatus())
                .valid(voucher.isUsableAt(now, voucher.getMinOrderAmount()))
                .build();
    }
}
