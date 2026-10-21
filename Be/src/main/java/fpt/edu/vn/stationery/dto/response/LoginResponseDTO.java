package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private Long userId;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String token;
    private String accessToken;
    private String tokenType;
}
