package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;

public interface CartService {
    CartResponseDTO getCart(String email, String shippingMethod, String voucherCode);
    CartResponseDTO addItem(String email, CartItemInputDTO request);
    CartResponseDTO updateItem(String email, Long cartItemId, int quantity);
    CartResponseDTO removeItem(String email, Long cartItemId);
    CartResponseDTO clear(String email);
}
