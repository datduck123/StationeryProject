package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.NotificationResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;

public interface NotificationService {
    PageDTO<NotificationResponseDTO> getMyNotifications(String email, Boolean isRead, int page, int size);
    NotificationResponseDTO markAsRead(Long id, String email);
}
