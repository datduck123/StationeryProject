package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import java.util.List;

public interface BrandService {
    BrandResponseDTO createBrand(BrandRequestDTO request);
    BrandResponseDTO updateBrand(Long id, BrandRequestDTO request);
    void deleteBrand(Long id);
    List<BrandResponseDTO> getAllBrands();
    List<BrandResponseDTO> getActiveBrands();
    BrandResponseDTO getBrandById(Long id);
}
