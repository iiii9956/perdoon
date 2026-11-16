package com.example.backend.feature.friends;

import com.example.backend.feature.friends.dto.FriendRequestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    public FriendRequestController(FriendRequestService friendRequestService) {
        this.friendRequestService = friendRequestService;
    }
    //Отправить заявку
    @PostMapping("/requests/{userId}")
    public void sendRequest(
            @PathVariable Long userId,
            @AuthenticationPrincipal String currentUserId
    ) {
        friendRequestService.sendRequest(userId, currentUserId);
    }
    //Принять заявку
    @PostMapping("/requests/{id}/accept")
    public void acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal String currentUserId
    ) {
        friendRequestService.acceptRequest(id, currentUserId);
    }
    //Отклонить заявку
    @PostMapping("/requests/{id}/reject")
    public void rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal String currentUserId
    ) {
        friendRequestService.rejectRequest(id, currentUserId);
    }
    //Отменить исходящую заявку
    @DeleteMapping("/requests/{userId}")
    public void cancelRequest(
            @PathVariable Long userId,
            @AuthenticationPrincipal String currentUserId
    ) {
        friendRequestService.cancelRequest(userId, currentUserId);
    }
    //Получить заявки
    @GetMapping("/requests")
    public List<FriendRequestResponse> getRequests(
            @RequestParam String direction,
            @AuthenticationPrincipal String currentUserId
    ) {
        if ("incoming".equalsIgnoreCase(direction)) {
            return friendRequestService.getIncomingRequests(currentUserId);
        }

        if ("outgoing".equalsIgnoreCase(direction)) {
            return friendRequestService.getOutgoingRequests(currentUserId);
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "direction должен быть incoming или outgoing"
        );
    }
}