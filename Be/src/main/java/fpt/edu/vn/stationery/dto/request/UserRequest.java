package fpt.edu.vn.stationery.dto.request;

import lombok.Data;

@Data
public class UserRequest {
    private String email;
    private String password;
    private String fullName;
}
