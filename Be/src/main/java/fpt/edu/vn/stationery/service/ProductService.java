package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;

public interface ProductService {

    PageDTO<ProductResponseDTO> getProducts(int page, int size, String keyword, Long categoryId, Long brandId, String sort);

    ProductResponseDTO getProductById(Long id);
}
