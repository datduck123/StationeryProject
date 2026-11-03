package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateStockRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.ProductMapper;
import fpt.edu.vn.stationery.repository.BrandRepository;
import fpt.edu.vn.stationery.repository.CategoryRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.ReviewRepository;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of("price", "name", "createdAt", "productId", "stockQuantity", "sold");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;
    private final ReviewRepository reviewRepository;

    /** Converts a Product entity to DTO and enriches it with live rating/review-count data. */
    private ProductResponseDTO toEnrichedDto(Product product) {
        ProductResponseDTO dto = productMapper.toDto(product);
        Double rawAverage = reviewRepository.averageRatingByProductId(product.getProductId());
        double avg = rawAverage == null ? 0.0 : BigDecimal.valueOf(rawAverage).setScale(1, RoundingMode.HALF_UP).doubleValue();
        dto.setAvgRating(avg);
        dto.setReviewCount(reviewRepository.countByProductId(product.getProductId()));
        if (dto.getSold() == null) {
            dto.setSold(0);
        }
        return dto;
    }

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
        return getProducts(page, size, keyword, categoryId, brandId, minPrice, maxPrice, null, sort);
    }

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
            String stock,
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

        Specification<Product> spec = ProductSpecification.filterPublicProducts(keyword, categoryId, brandId, minPrice, maxPrice, stock);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponseDTO> dtoPage = productPage.map(this::toEnrichedDto);
        return PageDTO.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageDTO<ProductResponseDTO> getProductsAdmin(
            int page,
            int size,
            String keyword,
            Long categoryId,
            Long brandId,
            String status,
            String sort) {
        validatePagination(page, size);

        if (categoryId != null && categoryId <= 0) {
            categoryId = null;
        }
        if (brandId != null && brandId <= 0) {
            brandId = null;
        }

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<Product> spec = ProductSpecification.filterAdminProducts(keyword, categoryId, brandId, status);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponseDTO> dtoPage = productPage.map(this::toEnrichedDto);
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

        return toEnrichedDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductByIdAdmin(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID: " + id);
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        return toEnrichedDto(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        // Auto-generate SKU if not provided
        String sku;
        if (request.getSku() == null || request.getSku().isBlank()) {
            sku = "SKU-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            sku = request.getSku().trim();
            if (productRepository.existsBySku(sku)) {
                throw new DuplicateResourceException("Product with SKU '" + sku + "' already exists");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        product.setBrand(brand);
        product.setSku(sku);
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        if (product.getWeightKg() == null || product.getWeightKg().compareTo(BigDecimal.ZERO) <= 0) {
            product.setWeightKg(new BigDecimal("0.100"));
        }

        if (product.getStatus() == null) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        Product savedProduct = productRepository.save(product);
        return toEnrichedDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID: " + id);
        }

        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Keep existing SKU if not provided, otherwise update it
        String sku;
        if (request.getSku() == null || request.getSku().isBlank()) {
            sku = product.getSku(); // keep existing
        } else {
            sku = request.getSku().trim();
            if (productRepository.existsBySkuAndProductIdNot(sku, id)) {
                throw new DuplicateResourceException("Product with SKU '" + sku + "' already exists");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));

        productMapper.updateEntity(product, request);
        product.setCategory(category);
        product.setBrand(brand);
        product.setSku(sku);

        if (product.getWeightKg() == null || product.getWeightKg().compareTo(BigDecimal.ZERO) <= 0) {
            product.setWeightKg(new BigDecimal("0.100"));
        }

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        Product updatedProduct = productRepository.save(product);
        return toEnrichedDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID: " + id);
        }

        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (productRepository.countOrderItemsByProductId(id) > 0) {
            throw new BadRequestException("Cannot delete product as it is referenced by existing orders. Consider deactivating the product instead.");
        }

        if (productRepository.countCartItemsByProductId(id) > 0) {
            throw new BadRequestException("Cannot delete product as it is currently in customer carts. Consider deactivating the product instead.");
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateStock(Long id, UpdateStockRequestDTO request) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID: " + id);
        }

        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(request.getStockQuantity());
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
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

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getFeaturedProducts(int limit) {
        int safeLimit = limit > 0 && limit <= 50 ? limit : 8;
        Pageable pageable = PageRequest.of(0, safeLimit);
        List<Long> topRatedIds = reviewRepository.findTopRatedProductIds(pageable);
        List<Product> products = new java.util.ArrayList<>();
        if (!topRatedIds.isEmpty()) {
            List<Product> found = productRepository.findAllById(topRatedIds).stream()
                    .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                    .toList();
            for (Long id : topRatedIds) {
                found.stream().filter(p -> p.getProductId().equals(id)).findFirst().ifPresent(products::add);
            }
        }
        if (products.size() < safeLimit) {
            Pageable fillPageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "productId"));
            List<Product> fillers = productRepository.findAll(
                    ProductSpecification.filterPublicProducts(null, null, null, null, null),
                    fillPageable
            ).getContent();
            for (Product p : fillers) {
                if (products.stream().noneMatch(x -> x.getProductId().equals(p.getProductId()))) {
                    products.add(p);
                    if (products.size() >= safeLimit) break;
                }
            }
        }
        return products.stream().map(this::toEnrichedDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getBestSellerProducts(int limit) {
        int safeLimit = limit > 0 && limit <= 50 ? limit : 8;
        Pageable pageable = PageRequest.of(0, safeLimit);
        return productRepository.findTopBySoldDesc(pageable)
                .stream().map(this::toEnrichedDto).toList();
    }
}
