package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsResponseDTO {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long blockedUsers;
}
