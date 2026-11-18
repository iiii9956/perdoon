package com.example.backend.feature.friends;

import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FriendRequestServiceTest {

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FriendRequestService friendRequestService;

    @Test
    void rejectsRequestToYourself() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> friendRequestService.sendRequest(5L, "5")
        );

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void rejectsRequestWhenAlreadyFriends() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user(2L)));
        when(friendRequestRepository.countBetweenUsers(1L, 2L, FriendRequestStatus.ACCEPTED))
                .thenReturn(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> friendRequestService.sendRequest(2L, "1")
        );

        assertEquals(409, exception.getStatusCode().value());
    }

    @Test
    void savesPendingRequest() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user(2L)));

        friendRequestService.sendRequest(2L, "1");

        verify(friendRequestRepository).save(org.mockito.ArgumentMatchers.any(FriendRequest.class));
    }

    private User user(Long id) {
        User user = org.mockito.Mockito.mock(User.class);
        org.mockito.Mockito.lenient().when(user.getId()).thenReturn(id);
        return user;
    }

    private static void assertEquals(int expected, int actual) {
        org.junit.jupiter.api.Assertions.assertEquals(expected, actual);
    }
}
