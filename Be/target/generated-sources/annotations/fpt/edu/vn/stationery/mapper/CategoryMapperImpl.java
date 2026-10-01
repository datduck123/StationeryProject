package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.CategoryRequestDTO;
import fpt.edu.vn.stationery.dto.response.CategoryResponseDTO;
import fpt.edu.vn.stationery.entity.Category;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-01T17:37:26+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public Category toEntity(CategoryRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.name( dto.getName() );
        category.description( dto.getDescription() );
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
        categoryResponseDTO.name( entity.getName() );
        categoryResponseDTO.description( entity.getDescription() );
        categoryResponseDTO.status( entity.getStatus() );
        categoryResponseDTO.createdAt( entity.getCreatedAt() );
        categoryResponseDTO.updatedAt( entity.getUpdatedAt() );

        return categoryResponseDTO.build();
    }

    @Override
    public void updateEntity(Category entity, CategoryRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        entity.setName( dto.getName() );
        entity.setDescription( dto.getDescription() );
        entity.setStatus( dto.getStatus() );
    }
}
