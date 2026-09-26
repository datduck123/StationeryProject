package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-27T00:11:02+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class BrandMapperImpl implements BrandMapper {

    @Override
    public Brand toEntity(BrandRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Brand.BrandBuilder brand = Brand.builder();

        brand.description( dto.getDescription() );
        brand.name( dto.getName() );

        return brand.build();
    }

    @Override
    public BrandResponseDTO toDto(Brand entity) {
        if ( entity == null ) {
            return null;
        }

        BrandResponseDTO.BrandResponseDTOBuilder brandResponseDTO = BrandResponseDTO.builder();

        brandResponseDTO.brandId( entity.getBrandId() );
        brandResponseDTO.createdAt( entity.getCreatedAt() );
        brandResponseDTO.description( entity.getDescription() );
        brandResponseDTO.name( entity.getName() );
        brandResponseDTO.updatedAt( entity.getUpdatedAt() );

        return brandResponseDTO.build();
    }

    @Override
    public void updateEntity(Brand entity, BrandRequestDTO dto) {
        if ( dto == null ) {
            return;
        }

        entity.setDescription( dto.getDescription() );
        entity.setName( dto.getName() );
    }
}
