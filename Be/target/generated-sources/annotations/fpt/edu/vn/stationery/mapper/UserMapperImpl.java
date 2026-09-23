package fpt.edu.vn.stationery.mapper;

import fpt.edu.vn.stationery.dto.response.UserProfileResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-23T08:33:01+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponseDTO toUserResponseDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponseDTO.UserResponseDTOBuilder userResponseDTO = UserResponseDTO.builder();

        userResponseDTO.id( user.getUserId() );
        userResponseDTO.userId( user.getUserId() );
        userResponseDTO.fullName( user.getFullName() );
        userResponseDTO.email( user.getEmail() );
        userResponseDTO.phone( user.getPhone() );
        userResponseDTO.address( user.getAddress() );
        userResponseDTO.isAdmin( user.getIsAdmin() );
        userResponseDTO.createdAt( user.getCreatedAt() );
        userResponseDTO.updatedAt( user.getUpdatedAt() );

        userResponseDTO.role( (user.getIsAdmin() != null && user.getIsAdmin() == 1) ? "ROLE_ADMIN" : "ROLE_CUSTOMER" );
        userResponseDTO.status( user.getStatus() != null ? user.getStatus().name() : "ACTIVE" );

        return userResponseDTO.build();
    }

    @Override
    public List<UserResponseDTO> toUserResponseDTOList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserResponseDTO> list = new ArrayList<UserResponseDTO>( users.size() );
        for ( User user : users ) {
            list.add( toUserResponseDTO( user ) );
        }

        return list;
    }

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse userResponse = new UserResponse();

        userResponse.setId( user.getUserId() );
        userResponse.setEmail( user.getEmail() );
        userResponse.setFullName( user.getFullName() );

        userResponse.setRole( (user.getIsAdmin() != null && user.getIsAdmin() == 1) ? "ROLE_ADMIN" : "ROLE_CUSTOMER" );

        return userResponse;
    }

    @Override
    public List<UserResponse> toResponseList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserResponse> list = new ArrayList<UserResponse>( users.size() );
        for ( User user : users ) {
            list.add( toResponse( user ) );
        }

        return list;
    }

    @Override
    public UserProfileResponseDTO toProfileResponseDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserProfileResponseDTO.UserProfileResponseDTOBuilder userProfileResponseDTO = UserProfileResponseDTO.builder();

        userProfileResponseDTO.id( user.getUserId() );
        userProfileResponseDTO.fullName( user.getFullName() );
        userProfileResponseDTO.email( user.getEmail() );
        userProfileResponseDTO.phone( user.getPhone() );
        userProfileResponseDTO.address( user.getAddress() );

        userProfileResponseDTO.role( (user.getIsAdmin() != null && user.getIsAdmin() == 1) ? "ROLE_ADMIN" : "ROLE_CUSTOMER" );

        return userProfileResponseDTO.build();
    }
}
