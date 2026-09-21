package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.entity.User;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    List<UserResponse> toResponseList(List<User> users);
}
