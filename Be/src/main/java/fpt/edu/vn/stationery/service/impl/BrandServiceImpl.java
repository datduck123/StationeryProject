package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.BrandMapper;
import fpt.edu.vn.stationery.repository.BrandRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final BrandMapper brandMapper;

    @Override
    @Transactional
    public BrandResponseDTO createBrand(BrandRequestDTO request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Brand name already exists");
        }
        Brand brand = brandMapper.toEntity(request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            brand.setStatus(request.getStatus().trim().toUpperCase());
        } else {
            brand.setStatus("ACTIVE");
        }
        Brand savedBrand = brandRepository.save(brand);
        BrandResponseDTO dto = brandMapper.toDto(savedBrand);
        dto.setProductCount(0L);
        return dto;
    }

    @Override
    @Transactional
    public BrandResponseDTO updateBrand(Long id, BrandRequestDTO request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        if (brandRepository.existsByNameAndBrandIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Brand name already exists");
        }

        brandMapper.updateEntity(brand, request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            brand.setStatus(request.getStatus().trim().toUpperCase());
        }
        Brand updatedBrand = brandRepository.save(brand);
        BrandResponseDTO dto = brandMapper.toDto(updatedBrand);
        dto.setProductCount(productRepository.countByBrandBrandId(id));
        return dto;
    }

    @Override
    @Transactional
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found with id: " + id);
        }

        if (productRepository.existsByBrandBrandId(id)) {
            throw new BadRequestException("Cannot delete brand as it is linked to one or more products.");
        }

        brandRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponseDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(brand -> {
                    BrandResponseDTO dto = brandMapper.toDto(brand);
                    if (brand.getBrandId() != null) {
                        dto.setProductCount(productRepository.countByBrandBrandId(brand.getBrandId()));
                    } else {
                        dto.setProductCount(0L);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponseDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        BrandResponseDTO dto = brandMapper.toDto(brand);
        dto.setProductCount(productRepository.countByBrandBrandId(id));
        return dto;
    }
}
