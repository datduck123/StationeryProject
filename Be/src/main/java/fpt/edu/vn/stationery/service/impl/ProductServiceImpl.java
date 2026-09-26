package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.ProductMapper;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.ProductService;
import fpt.edu.vn.stationery.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of("price", "name", "createdAt", "productId", "stockQuantity");

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageDTO<ProductResponseDTO> getProducts(
            int page,
            int size,
            String keyword,
            Long categoryId,
            Long brandId,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            String sort) {
        validatePagination(page, size);

        if (categoryId != null && categoryId <= 0) {
            throw new BadRequestException("Invalid category ID: " + categoryId);
        }
        if (brandId != null && brandId <= 0) {
            throw new BadRequestException("Invalid brand ID: " + brandId);
        }
        if (minPrice != null && minPrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("minPrice must not be negative");
        }
        if (maxPrice != null && maxPrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("maxPrice must not be negative");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("minPrice must be less than or equal to maxPrice");
        }

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<Product> spec = ProductSpecification.filterPublicProducts(keyword, categoryId, brandId, minPrice, maxPrice);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponseDTO> dtoPage = productPage.map(productMapper::toDto);
        return PageDTO.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID: " + id);
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        return productMapper.toDto(product);
    }

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new BadRequestException("Page size must be greater than zero");
        }
        if (size > 100) {
            throw new BadRequestException("Page size must not exceed 100");
        }
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "price");
        }

        String[] parts = sort.split(",");
        String property = parts[0].trim();
        if ("id".equalsIgnoreCase(property)) {
            property = "productId";
        }

        if (!ALLOWED_SORT_FIELDS.contains(property)) {
            throw new BadRequestException("Invalid sort field: '" + property + "'. Allowed fields: " + String.join(", ", ALLOWED_SORT_FIELDS));
        }

        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length > 1) {
            String dirStr = parts[1].trim().toLowerCase();
            if ("desc".equals(dirStr)) {
                direction = Sort.Direction.DESC;
            } else if ("asc".equals(dirStr)) {
                direction = Sort.Direction.ASC;
            } else {
                throw new BadRequestException("Invalid sort direction: '" + dirStr + "'. Must be 'asc' or 'desc'");
            }
        }

        return Sort.by(direction, property);
    }
}
