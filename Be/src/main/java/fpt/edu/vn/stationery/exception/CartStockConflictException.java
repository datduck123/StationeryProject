package fpt.edu.vn.stationery.exception;

import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import lombok.Getter;

@Getter
public class CartStockConflictException extends RuntimeException {

    private final CartResponseDTO cartResponse;

    public CartStockConflictException(String message, CartResponseDTO cartResponse) {
        super(message);
        this.cartResponse = cartResponse;
    }
}
