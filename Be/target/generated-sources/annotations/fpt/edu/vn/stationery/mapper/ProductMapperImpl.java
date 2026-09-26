package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.BrandSummaryDTO;
import fpt.edu.vn.stationery.dto.response.CategorySummaryDTO;
import fpt.edu.vn.stationery.dto.response.ProductResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import fpt.edu.vn.stationery.entity.Category;
import fpt.edu.vn.stationery.entity.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-27T00:11:02+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponseDTO toDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductResponseDTO.ProductResponseDTOBuilder productResponseDTO = ProductResponseDTO.builder();

        productResponseDTO.brand( toBrandSummaryDTO( entity.getBrand() ) );
        productResponseDTO.category( toCategorySummaryDTO( entity.getCategory() ) );
        productResponseDTO.createdAt( entity.getCreatedAt() );
        productResponseDTO.description( entity.getDescription() );
        productResponseDTO.imageUrl( entity.getImageUrl() );
        productResponseDTO.name( entity.getName() );
        productResponseDTO.price( entity.getPrice() );
        productResponseDTO.productId( entity.getProductId() );
        productResponseDTO.sku( entity.getSku() );
        productResponseDTO.status( entity.getStatus() );
        productResponseDTO.stockQuantity( entity.getStockQuantity() );
        productResponseDTO.updatedAt( entity.getUpdatedAt() );
        productResponseDTO.weightKg( entity.getWeightKg() );

        return productResponseDTO.build();
    }

    @Override
    public List<ProductResponseDTO> toDtoList(List<Product> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ProductResponseDTO> list = new ArrayList<ProductResponseDTO>( entities.size() );
        for ( Product product : entities ) {
            list.add( toDto( product ) );
        }

        return list;
    }

    @Override
    public CategorySummaryDTO toCategorySummaryDTO(Category category) {
        if ( category == null ) {
            return null;
        }

        CategorySummaryDTO.CategorySummaryDTOBuilder categorySummaryDTO = CategorySummaryDTO.builder();

        categorySummaryDTO.categoryId( category.getCategoryId() );
        categorySummaryDTO.name( category.getName() );

        return categorySummaryDTO.build();
    }

    @Override
    public BrandSummaryDTO toBrandSummaryDTO(Brand brand) {
        if ( brand == null ) {
            return null;
        }

        BrandSummaryDTO.BrandSummaryDTOBuilder brandSummaryDTO = BrandSummaryDTO.builder();

        brandSummaryDTO.brandId( brand.getBrandId() );
        brandSummaryDTO.name( brand.getName() );

        return brandSummaryDTO.build();
    }
}
