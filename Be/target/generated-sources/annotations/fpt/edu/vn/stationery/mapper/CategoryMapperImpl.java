package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.CategoryRequestDTO;
import fpt.edu.vn.stationery.dto.response.CategoryResponseDTO;
import fpt.edu.vn.stationery.entity.Category;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-28T00:33:50+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public Category toEntity(CategoryRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.description( dto.getDescription() );
        category.name( dto.getName() );
        category.status( dto.getStatus() );

        return category.build();
    }

    @Override
    public CategoryResponseDTO toDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryResponseDTO.CategoryResponseDTOBuilder categoryResponseDTO = CategoryResponseDTO.builder();

        categoryResponseDTO.categoryId( entity.getCategoryId() );
        categoryResponseDTO.createdAt( entity.getCreatedAt() );
        categoryResponseDTO.description( entity.getDescription() );
        categoryResponseDTO.name( entity.getName() );
        categoryResponseDTO.status( entity.getStatus() );
        categoryResponseDTO.updatedAt( entity.getUpdatedAt() );

        return categoryResponseDTO.build();
    }

    @Override
    public void updateEntity(Category entity, CategoryRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        entity.setDescription( dto.getDescription() );
        entity.setName( dto.getName() );
        entity.setStatus( dto.getStatus() );
    }
}
