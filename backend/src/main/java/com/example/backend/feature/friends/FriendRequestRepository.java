package com.example.backend.feature.friends;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository
        extends JpaRepository<FriendRequest, Long> {

    // Проверка существующей заявки между пользователями
    boolean existsBySenderIdAndReceiverIdAndStatus(
            Long senderId,
            Long receiverId,
            FriendRequestStatus status
    );

    // Поиск входящих заявок
    List<FriendRequest> findAllByReceiverIdAndStatusOrderByCreatedAtDesc(
            Long receiverId,
            FriendRequestStatus status
    );

    // Поиск исходящих заявок
    List<FriendRequest> findAllBySenderIdAndStatusOrderByCreatedAtDesc(
            Long senderId,
            FriendRequestStatus status
    );

    // Поиск конкретной заявки
    Optional<FriendRequest> findByIdAndReceiverIdAndStatus(
            Long id,
            Long receiverId,
            FriendRequestStatus status
    );

    // Поиск заявки для отмены
    Optional<FriendRequest> findBySenderIdAndReceiverIdAndStatus(
            Long senderId,
            Long receiverId,
            FriendRequestStatus status
    );
}