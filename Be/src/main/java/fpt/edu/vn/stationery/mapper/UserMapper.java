package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.UserProfileResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", source = "userId")
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "role", expression = "java((user.getIsAdmin() != null && user.getIsAdmin() == 1) ? \"ROLE_ADMIN\" : \"ROLE_CUSTOMER\")")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().name() : \"ACTIVE\")")
    UserResponseDTO toUserResponseDTO(User user);

    List<UserResponseDTO> toUserResponseDTOList(List<User> users);

    @Mapping(target = "id", source = "userId")
    @Mapping(target = "role", expression = "java((user.getIsAdmin() != null && user.getIsAdmin() == 1) ? \"ROLE_ADMIN\" : \"ROLE_CUSTOMER\")")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "id", source = "userId")
    @Mapping(target = "role", expression = "java((user.getIsAdmin() != null && user.getIsAdmin() == 1) ? \"ROLE_ADMIN\" : \"ROLE_CUSTOMER\")")
    UserProfileResponseDTO toProfileResponseDTO(User user);
}
