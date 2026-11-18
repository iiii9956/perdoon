package com.example.backend.feature.friends;

import com.example.backend.feature.friends.dto.FriendRequestResponse;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    public FriendRequestService(
            FriendRequestRepository friendRequestRepository,
            UserRepository userRepository
    ) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
    }
    @Transactional
    public void sendRequest(Long receiverId, String currentUserId) {

        Long senderId = Long.parseLong(currentUserId);

        // Нельзя отправить заявку самому себе
        if (senderId.equals(receiverId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Нельзя отправить заявку самому себе"
            );
        }

        // Проверяем получателя
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ваш аккаунт не найден"
                ));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Пользователь не найден"
                ));

        // Проверяем повторную заявку в том же направлении
        if (friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(
                senderId, receiverId, FriendRequestStatus.PENDING)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Заявка уже отправлена"
            );
        }

        // Проверяем, нет ли встречной заявки
        if (friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(
                receiverId, senderId, FriendRequestStatus.PENDING)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот пользователь уже отправил вам заявку"
            );
        }

        if (friendRequestRepository.countBetweenUsers(
                senderId, receiverId, FriendRequestStatus.ACCEPTED) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Вы уже друзья"
            );
        }

        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(FriendRequestStatus.PENDING);

        friendRequestRepository.save(request);
    }
    @Transactional
    public void acceptRequest(Long requestId, String currentUserId) {

        Long receiverId = Long.parseLong(currentUserId);

        FriendRequest request = friendRequestRepository
                .findByIdAndReceiverIdAndStatus(
                        requestId,
                        receiverId,
                        FriendRequestStatus.PENDING
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Входящая заявка не найдена"
                ));

        request.setStatus(FriendRequestStatus.ACCEPTED);

        friendRequestRepository.save(request);
    }
    @Transactional
    public void rejectRequest(Long requestId, String currentUserId) {

        Long receiverId = Long.parseLong(currentUserId);

        FriendRequest request = friendRequestRepository
                .findByIdAndReceiverIdAndStatus(
                        requestId,
                        receiverId,
                        FriendRequestStatus.PENDING
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Входящая заявка не найдена"
                ));

        request.setStatus(FriendRequestStatus.REJECTED);

        friendRequestRepository.save(request);
    }
    @Transactional
    public void cancelRequest(Long receiverId, String currentUserId) {

        Long senderId = Long.parseLong(currentUserId);

        FriendRequest request = friendRequestRepository
                .findBySenderIdAndReceiverIdAndStatus(
                        senderId,
                        receiverId,
                        FriendRequestStatus.PENDING
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Исходящая заявка не найдена"
                ));

        friendRequestRepository.delete(request);
    }
    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getIncomingRequests(String currentUserId) {

        Long userId = Long.parseLong(currentUserId);

        return friendRequestRepository
                .findAllByReceiverIdAndStatusOrderByCreatedAtDesc(
                        userId,
                        FriendRequestStatus.PENDING
                )
                .stream()
                .map(request -> new FriendRequestResponse(request, true))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getOutgoingRequests(String currentUserId) {

        Long userId = Long.parseLong(currentUserId);

        return friendRequestRepository
                .findAllBySenderIdAndStatusOrderByCreatedAtDesc(
                        userId,
                        FriendRequestStatus.PENDING
                )
                .stream()
                .map(request -> new FriendRequestResponse(request, false))
                .collect(Collectors.toList());
    }
}