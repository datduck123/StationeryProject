package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.ProductRequestDTO;
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
    date = "2026-10-26T22:26:28+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponseDTO toDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductResponseDTO.ProductResponseDTOBuilder productResponseDTO = ProductResponseDTO.builder();

        productResponseDTO.productId( entity.getProductId() );
        productResponseDTO.sku( entity.getSku() );
        productResponseDTO.name( entity.getName() );
        productResponseDTO.price( entity.getPrice() );
        productResponseDTO.weightKg( entity.getWeightKg() );
        productResponseDTO.stockQuantity( entity.getStockQuantity() );
        productResponseDTO.sold( entity.getSold() );
        productResponseDTO.description( entity.getDescription() );
        productResponseDTO.imageUrl( entity.getImageUrl() );
        productResponseDTO.category( toCategorySummaryDTO( entity.getCategory() ) );
        productResponseDTO.brand( toBrandSummaryDTO( entity.getBrand() ) );
        productResponseDTO.status( entity.getStatus() );
        productResponseDTO.createdAt( entity.getCreatedAt() );
        productResponseDTO.updatedAt( entity.getUpdatedAt() );

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

    @Override
    public Product toEntity(ProductRequestDTO request) {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.sku( request.getSku() );
        product.name( request.getName() );
        product.price( request.getPrice() );
        product.weightKg( request.getWeightKg() );
        product.stockQuantity( request.getStockQuantity() );
        product.description( request.getDescription() );
        product.status( request.getStatus() );

        product.imageUrl( request.resolveImageUrl() );

        return product.build();
    }

    @Override
    public void updateEntity(Product entity, ProductRequestDTO request) {
        if ( request == null ) {
            return;
        }

        entity.setSku( request.getSku() );
        entity.setName( request.getName() );
        entity.setPrice( request.getPrice() );
        entity.setWeightKg( request.getWeightKg() );
        entity.setStockQuantity( request.getStockQuantity() );
        entity.setDescription( request.getDescription() );
        entity.setStatus( request.getStatus() );

        entity.setImageUrl( request.resolveImageUrl() );
    }
}
