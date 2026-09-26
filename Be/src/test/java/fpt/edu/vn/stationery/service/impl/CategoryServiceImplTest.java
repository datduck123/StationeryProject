package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.CategoryRequestDTO;
import fpt.edu.vn.stationery.dto.response.CategoryResponseDTO;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.mapper.CategoryMapper;
import fpt.edu.vn.stationery.repository.CategoryRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private CategoryRequestDTO requestDTO;
    private Category category;
    private CategoryResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = CategoryRequestDTO.builder().name("Test Category").description("Desc").build();
        category = Category.builder().categoryId(1L).name("Test Category").description("Desc").build();
        responseDTO = CategoryResponseDTO.builder().categoryId(1L).name("Test Category").description("Desc").build();
    }

    @Test
    void createCategory_Success() {
        when(categoryRepository.existsByName(requestDTO.getName())).thenReturn(false);
        when(categoryMapper.toEntity(requestDTO)).thenReturn(category);
        when(categoryRepository.save(category)).thenReturn(category);
        when(categoryMapper.toDto(category)).thenReturn(responseDTO);

        CategoryResponseDTO result = categoryService.createCategory(requestDTO);

        assertNotNull(result);
        assertEquals(1L, result.getCategoryId());
        verify(categoryRepository).save(category);
    }

    @Test
    void createCategory_DuplicateName_ThrowsException() {
        when(categoryRepository.existsByName(requestDTO.getName())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.createCategory(requestDTO));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void deleteCategory_Success() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(productRepository.existsByCategoryCategoryId(1L)).thenReturn(false);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void deleteCategory_HasProducts_ThrowsException() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(productRepository.existsByCategoryCategoryId(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> categoryService.deleteCategory(1L));
        verify(categoryRepository, never()).deleteById(any());
    }
}
