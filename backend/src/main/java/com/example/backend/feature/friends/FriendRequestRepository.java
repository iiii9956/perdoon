package com.example.backend.feature.friends;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select count(f) from FriendRequest f
            where f.status = :status
              and (
                    (f.sender.id = :firstUserId and f.receiver.id = :secondUserId)
                    or (f.sender.id = :secondUserId and f.receiver.id = :firstUserId)
                  )
            """)
    long countBetweenUsers(
            @Param("firstUserId") Long firstUserId,
            @Param("secondUserId") Long secondUserId,
            @Param("status") FriendRequestStatus status
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from FriendRequest f
            where f.sender.id = :userId or f.receiver.id = :userId
            """)
    void deleteAllForUser(@Param("userId") Long userId);
}