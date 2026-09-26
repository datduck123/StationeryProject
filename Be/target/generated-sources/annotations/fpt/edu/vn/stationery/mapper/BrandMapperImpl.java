package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-26T00:17:23+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class BrandMapperImpl implements BrandMapper {

    @Override
    public Brand toEntity(BrandRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Brand.BrandBuilder brand = Brand.builder();

        brand.name( dto.getName() );
        brand.description( dto.getDescription() );

        return brand.build();
    }

    @Override
    public BrandResponseDTO toDto(Brand entity) {
        if ( entity == null ) {
            return null;
        }

        BrandResponseDTO.BrandResponseDTOBuilder brandResponseDTO = BrandResponseDTO.builder();

        brandResponseDTO.brandId( entity.getBrandId() );
        brandResponseDTO.name( entity.getName() );
        brandResponseDTO.description( entity.getDescription() );
        brandResponseDTO.createdAt( entity.getCreatedAt() );
        brandResponseDTO.updatedAt( entity.getUpdatedAt() );

        return brandResponseDTO.build();
    }

    @Override
    public void updateEntity(Brand entity, BrandRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        entity.setName( dto.getName() );
        entity.setDescription( dto.getDescription() );
    }
}
