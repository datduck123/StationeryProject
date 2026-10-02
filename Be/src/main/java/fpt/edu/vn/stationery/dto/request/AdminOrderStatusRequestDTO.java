package fpt.edu.vn.stationery.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminOrderStatusRequestDTO(@NotBlank String status) {
}
