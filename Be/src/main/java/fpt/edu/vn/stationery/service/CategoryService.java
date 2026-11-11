package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CategoryRequestDTO;
import fpt.edu.vn.stationery.dto.response.CategoryResponseDTO;
import java.util.List;

public interface CategoryService {
    CategoryResponseDTO createCategory(CategoryRequestDTO request);
    CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request);
    void deleteCategory(Long id);
    List<CategoryResponseDTO> getAllCategories();
    List<CategoryResponseDTO> getActiveCategories();
    CategoryResponseDTO getCategoryById(Long id);
}
