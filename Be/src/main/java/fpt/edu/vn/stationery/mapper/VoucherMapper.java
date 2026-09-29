package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.VoucherRequestDTO;
import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.entity.Voucher;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class VoucherMapper {

    public Voucher toEntity(VoucherRequestDTO dto) {
        if (dto == null) return null;

        return Voucher.builder()
                .code(dto.getCode() != null ? dto.getCode().trim().toUpperCase() : null)
                .discountPercent(dto.getDiscountPercent())
                .maxDiscount(dto.getMaxDiscount())
                .minOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : java.math.BigDecimal.ZERO)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .usageLimit(dto.getUsageLimit())
                .usedCount(0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    public void updateEntity(Voucher entity, VoucherRequestDTO dto) {
        if (entity == null || dto == null) return;

        if (dto.getCode() != null) {
            entity.setCode(dto.getCode().trim().toUpperCase());
        }
        if (dto.getDiscountPercent() != null) {
            entity.setDiscountPercent(dto.getDiscountPercent());
        }
        entity.setMaxDiscount(dto.getMaxDiscount());
        if (dto.getMinOrderAmount() != null) {
            entity.setMinOrderAmount(dto.getMinOrderAmount());
        }
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setUsageLimit(dto.getUsageLimit());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }
    }

    public VoucherResponseDTO toDto(Voucher entity) {
        if (entity == null) return null;

        LocalDateTime now = LocalDateTime.now();
        String status = "ACTIVE";
        boolean isValid = true;

        if (!Boolean.TRUE.equals(entity.getIsActive())) {
            status = "INACTIVE";
            isValid = false;
        } else if (entity.getEndDate() != null && now.isAfter(entity.getEndDate())) {
            status = "EXPIRED";
            isValid = false;
        } else if (entity.getStartDate() != null && now.isBefore(entity.getStartDate())) {
            status = "UPCOMING";
            isValid = false;
        } else if (entity.getUsageLimit() != null && entity.getUsedCount() != null && entity.getUsedCount() >= entity.getUsageLimit()) {
            status = "DEPLETED";
            isValid = false;
        }

        return VoucherResponseDTO.builder()
                .voucherId(entity.getVoucherId())
                .code(entity.getCode())
                .discountPercent(entity.getDiscountPercent())
                .maxDiscount(entity.getMaxDiscount())
                .minOrderAmount(entity.getMinOrderAmount())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .usageLimit(entity.getUsageLimit())
                .usedCount(entity.getUsedCount())
                .isActive(entity.getIsActive())
                .status(status)
                .isValid(isValid)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public List<VoucherResponseDTO> toDtoList(List<Voucher> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDto).toList();
    }
}
