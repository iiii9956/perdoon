package com.example.backend.feature.friends.dto;

import com.example.backend.feature.friends.FriendRequest;
import com.example.backend.feature.friends.FriendRequestStatus;
import java.time.LocalDateTime;

public class FriendRequestResponse {

    private Long id;
    private Long userId;
    private String username;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;

    public FriendRequestResponse(FriendRequest request, boolean incoming) {

        this.id = request.getId();

        if (incoming) {
            this.userId = request.getSender().getId();
            this.username = request.getSender().getUsername();
        } else {
            this.userId = request.getReceiver().getId();
            this.username = request.getReceiver().getUsername();
        }

        this.status = request.getStatus();
        this.createdAt = request.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public FriendRequestStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}