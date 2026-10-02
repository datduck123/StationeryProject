package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.dto.response.NotificationResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Notification;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.NotificationRepository;
import fpt.edu.vn.stationery.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public PageDTO<NotificationResponseDTO> getMyNotifications(String email, Boolean isRead, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<Notification> notifications = isRead == null
                ? notificationRepository.findByUser_Email(email, pageable)
                : notificationRepository.findByUser_EmailAndRead(email, isRead, pageable);
        return PageDTO.from(notifications.map(this::toResponse));
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Long id, String email) {
        Notification notification = notificationRepository.findByIdAndUser_Email(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return toResponse(notification);
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .orderId(notification.getOrder().getOrderId())
                .type(notification.getType().getCode())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
