package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponseDTO {
    private Long reviewId;
    private Long orderItemId;
    private Long productId;
    private String userFullName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
