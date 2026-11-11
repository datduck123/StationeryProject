package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.CategoryRequestDTO;
import fpt.edu.vn.stationery.dto.response.CategoryResponseDTO;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.CategoryMapper;
import fpt.edu.vn.stationery.repository.CategoryRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category name already exists");
        }
        Category category = categoryMapper.toEntity(request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            category.setStatus(request.getStatus().trim().toUpperCase());
        } else {
            category.setStatus("ACTIVE");
        }
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByNameAndCategoryIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Category name already exists");
        }

        categoryMapper.updateEntity(category, request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            category.setStatus(request.getStatus().trim().toUpperCase());
        }
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        if (productRepository.existsByCategoryCategoryId(id)) {
            throw new BadRequestException("Cannot delete category as it is linked to one or more products.");
        }

        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> {
                    CategoryResponseDTO dto = categoryMapper.toDto(cat);
                    if (cat.getCategoryId() != null) {
                        dto.setProductCount(productRepository.countByCategoryCategoryId(cat.getCategoryId()));
                    } else {
                        dto.setProductCount(0L);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        CategoryResponseDTO dto = categoryMapper.toDto(category);
        dto.setProductCount(productRepository.countByCategoryCategoryId(id));
        return dto;
    }
}
