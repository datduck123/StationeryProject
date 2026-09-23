package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String token; // alias for compatibility
    private String tokenType; // "Bearer"
    private String role;
    private String fullName;
    private String email;
    private Long userId;

    public AuthResponse(String token, String email, String role) {
        this.accessToken = token;
        this.token = token;
        this.tokenType = "Bearer";
        this.email = email;
        this.role = role;
    }
}
