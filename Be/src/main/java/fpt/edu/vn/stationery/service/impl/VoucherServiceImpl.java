package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.VoucherRequestDTO;
import fpt.edu.vn.stationery.dto.response.VoucherResponseDTO;
import fpt.edu.vn.stationery.entity.Voucher;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.VoucherMapper;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Primary
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    @Override
    @Transactional
    public VoucherResponseDTO createVoucher(VoucherRequestDTO request) {
        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : "";
        if (code.isEmpty()) {
            throw new BadRequestException("Voucher code must not be empty");
        }
        if (code.length() < 2 || code.length() > 8) {
            throw new BadRequestException("Voucher code must be between 2 and 8 characters");
        }

        if (voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Voucher code '" + code + "' already exists");
        }

        validateVoucherRules(request);

        Voucher voucher = voucherMapper.toEntity(request);
        voucher.setCode(code);
        Voucher savedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toDto(savedVoucher);
    }

    @Override
    @Transactional
    public VoucherResponseDTO updateVoucher(Long id, VoucherRequestDTO request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));

        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : "";
        if (code.isEmpty()) {
            throw new BadRequestException("Voucher code must not be empty");
        }
        if (code.length() < 2 || code.length() > 8) {
            throw new BadRequestException("Voucher code must be between 2 and 8 characters");
        }

        if (voucherRepository.existsByCodeIgnoreCaseAndVoucherIdNot(code, id)) {
            throw new DuplicateResourceException("Voucher code '" + code + "' already exists");
        }

        if (request.getUsageLimit() != null && voucher.getUsedCount() != null && request.getUsageLimit() < voucher.getUsedCount()) {
            throw new BadRequestException("Usage limit (" + request.getUsageLimit() + ") cannot be less than current used count (" + voucher.getUsedCount() + ")");
        }

        validateVoucherRules(request);

        voucherMapper.updateEntity(voucher, request);
        voucher.setCode(code);
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toDto(updatedVoucher);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));

        voucherRepository.delete(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponseDTO getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));
        return voucherMapper.toDto(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponseDTO getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with code: " + code));
        return voucherMapper.toDto(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> getAllVouchers() {
        List<Voucher> vouchers = voucherRepository.findAll();
        return voucherMapper.toDtoList(vouchers);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers = voucherRepository.findActive(now);
        return voucherMapper.toDtoList(vouchers);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> searchVouchers(String keyword, Boolean isActive) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        List<Voucher> vouchers = voucherRepository.searchVouchersList(cleanKeyword, isActive);
        return voucherMapper.toDtoList(vouchers);
    }

    @Override
    @Transactional
    public VoucherResponseDTO toggleVoucherStatus(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));

        boolean currentStatus = Boolean.TRUE.equals(voucher.getIsActive());
        voucher.setIsActive(!currentStatus);
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toDto(updatedVoucher);
    }

    @Override
    @Transactional
    public VoucherResponseDTO updateVoucherStatus(Long id, Boolean isActive) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));

        voucher.setIsActive(Boolean.TRUE.equals(isActive));
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toDto(updatedVoucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponseDTO validateVoucher(String code, BigDecimal orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Voucher code is required");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher code '" + code + "' does not exist"));

        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            throw new BadRequestException("This voucher is currently inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new BadRequestException("This voucher is not active yet (starts on " + voucher.getStartDate() + ")");
        }

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new BadRequestException("This voucher has expired on " + voucher.getEndDate());
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("This voucher has reached its maximum usage limit");
        }

        if (orderAmount != null && voucher.getMinOrderAmount() != null && orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Order value must be at least $" + voucher.getMinOrderAmount() + " to use this voucher");
        }

        return voucherMapper.toDto(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateDiscount(Long voucherId, BigDecimal subtotal) {
        if (voucherId == null || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại hoặc đã bị xóa."));

        LocalDateTime now = LocalDateTime.now();
        if (!voucher.isUsableAt(now, subtotal)) {
            throw new BadRequestException("Mã giảm giá không hợp lệ, chưa tới hạn, đã hết hạn hoặc chưa đạt giá trị tối thiểu.");
        }

        return voucher.calculateDiscount(subtotal);
    }

    private void validateVoucherRules(VoucherRequestDTO request) {
        if (request.getDiscountPercent() == null ||
                request.getDiscountPercent().compareTo(BigDecimal.ZERO) <= 0 ||
                request.getDiscountPercent().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Discount percentage must be between 0.01% and 100%");
        }

        if (request.getMaxDiscount() != null && request.getMaxDiscount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Max discount cap cannot be negative");
        }

        if (request.getMinOrderAmount() != null && request.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Minimum order amount cannot be negative");
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("End date cannot be before start date");
            }
        }
    }
}
