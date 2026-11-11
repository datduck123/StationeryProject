package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummaryDTO {
    private Long categoryId;
    private String name;
}
