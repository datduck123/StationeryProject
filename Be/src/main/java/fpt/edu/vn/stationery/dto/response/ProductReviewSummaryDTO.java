package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ProductReviewSummaryDTO {
    private PageDTO<ReviewResponseDTO> reviews;
    private double averageRating;
    private long reviewCount;
    private Map<Integer, Long> ratingDistribution;
}
