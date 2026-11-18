package com.example.backend.feature.chat;

import com.example.backend.feature.chat.dto.ChatSendRequest;
import com.example.backend.feature.friends.FriendRequestRepository;
import com.example.backend.feature.friends.FriendRequestStatus;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    @Test
    void rejectsChatWithNonFriend() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user(2L)));
        when(friendRequestRepository.countBetweenUsers(1L, 2L, FriendRequestStatus.ACCEPTED))
                .thenReturn(0L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> chatService.open(1L, 2L)
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void rejectsMessageFromOutsider() {
        Conversation conversation = conversationBetween(2L, 3L);
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));

        ChatSendRequest request = new ChatSendRequest();
        request.setConversationId(10L);
        request.setContent("привет");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> chatService.send(1L, request)
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void sendsMessageToBothParticipants() {
        Conversation conversation = conversationBetween(1L, 2L);
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(1L)).thenReturn(Optional.of(conversation.getUserOne()));
        when(chatMessageRepository.save(any(ChatMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(conversationRepository.save(any(Conversation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ChatSendRequest request = new ChatSendRequest();
        request.setConversationId(10L);
        request.setContent("  привет  ");

        chatService.send(1L, request);

        verify(messagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/messages"), any());
        verify(messagingTemplate).convertAndSendToUser(eq("2"), eq("/queue/messages"), any());
    }

    private Conversation conversationBetween(Long firstId, Long secondId) {
        Conversation conversation = new Conversation();
        conversation.setUserOne(user(firstId));
        conversation.setUserTwo(user(secondId));
        return conversation;
    }

    private User user(Long id) {
        User user = org.mockito.Mockito.mock(User.class);
        org.mockito.Mockito.lenient().when(user.getId()).thenReturn(id);
        org.mockito.Mockito.lenient().when(user.getUsername()).thenReturn("user-" + id);
        return user;
    }
}
