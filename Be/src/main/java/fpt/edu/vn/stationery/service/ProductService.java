package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateStockRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;

import java.math.BigDecimal;

public interface ProductService {

    PageDTO<ProductResponseDTO> getProducts(
            int page,
            int size,
            String keyword,
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort);

    ProductResponseDTO getProductById(Long id);

    ProductResponseDTO getProductByIdAdmin(Long id);

    ProductResponseDTO createProduct(ProductRequestDTO request);

    ProductResponseDTO updateProduct(Long id, ProductRequestDTO request);

    void deleteProduct(Long id);

    ProductResponseDTO updateStock(Long id, UpdateStockRequestDTO request);
}
