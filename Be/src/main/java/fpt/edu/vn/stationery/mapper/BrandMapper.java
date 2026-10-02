package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.request.BrandRequestDTO;
import fpt.edu.vn.stationery.dto.response.BrandResponseDTO;
import fpt.edu.vn.stationery.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BrandMapper {
    Brand toEntity(BrandRequestDTO dto);
    BrandResponseDTO toDto(Brand entity);
    void updateEntity(@MappingTarget Brand entity, BrandRequestDTO dto);
}
