package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.mapper.BrandMapper;
import fpt.edu.vn.stationery.repository.BrandRepository;
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
public class BrandServiceImplTest {

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BrandMapper brandMapper;

    @InjectMocks
    private BrandServiceImpl brandService;

    private BrandRequestDTO requestDTO;
    private Brand brand;
    private BrandResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = BrandRequestDTO.builder().name("Test Brand").description("Desc").build();
        brand = Brand.builder().brandId(1L).name("Test Brand").description("Desc").build();
        responseDTO = BrandResponseDTO.builder().brandId(1L).name("Test Brand").description("Desc").build();
    }

    @Test
    void createBrand_Success() {
        when(brandRepository.existsByName(requestDTO.getName())).thenReturn(false);
        when(brandMapper.toEntity(requestDTO)).thenReturn(brand);
        when(brandRepository.save(brand)).thenReturn(brand);
        when(brandMapper.toDto(brand)).thenReturn(responseDTO);

        BrandResponseDTO result = brandService.createBrand(requestDTO);

        assertNotNull(result);
        assertEquals(1L, result.getBrandId());
        verify(brandRepository).save(brand);
    }

    @Test
    void createBrand_DuplicateName_ThrowsException() {
        when(brandRepository.existsByName(requestDTO.getName())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> brandService.createBrand(requestDTO));
        verify(brandRepository, never()).save(any());
    }

    @Test
    void deleteBrand_Success() {
        when(brandRepository.existsById(1L)).thenReturn(true);
        when(productRepository.existsByBrandBrandId(1L)).thenReturn(false);

        brandService.deleteBrand(1L);

        verify(brandRepository).deleteById(1L);
    }

    @Test
    void deleteBrand_HasProducts_ThrowsException() {
        when(brandRepository.existsById(1L)).thenReturn(true);
        when(productRepository.existsByBrandBrandId(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> brandService.deleteBrand(1L));
        verify(brandRepository, never()).deleteById(any());
    }
}
