package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponseDTO {
    private Long categoryId;
    private String name;
    private String description;
    private String status;
    private Long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
