package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\p{L}]+$", message = "Full name must only contain letters and spaces")
    private String fullName;

    @Pattern(regexp = "^(0[1-9][0-9]{8})?$", message = "Phone must be 10 digits and the second digit must not be 0")
    private String phone;

    private String address;
}

