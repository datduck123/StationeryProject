package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.BrandSummaryDTO;
import fpt.edu.vn.stationery.dto.response.CategorySummaryDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    ProductResponseDTO toDto(Product entity);

    List<ProductResponseDTO> toDtoList(List<Product> entities);

    CategorySummaryDTO toCategorySummaryDTO(Category category);

    BrandSummaryDTO toBrandSummaryDTO(Brand brand);
}
