package com.example.backend.feature.chat;

import com.example.backend.feature.chat.dto.ChatMessageResponse;
import com.example.backend.feature.chat.dto.ChatSendRequest;
import com.example.backend.feature.chat.dto.ConversationResponse;
import com.example.backend.feature.friends.FriendRequestRepository;
import com.example.backend.feature.friends.FriendRequestStatus;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            FriendRequestRepository friendRequestRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> list(Long currentUserId) {
        return conversationRepository.findAllForUser(currentUserId)
                .stream()
                .map(conversation -> toConversationResponse(conversation, currentUserId))
                .toList();
    }

    @Transactional
    public ConversationResponse open(Long currentUserId, Long companionId) {
        if (companionId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите собеседника");
        }
        if (currentUserId.equals(companionId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Нельзя открыть чат с самим собой");
        }

        User currentUser = findUser(currentUserId, "Ваш аккаунт не найден");
        User companion = findUser(companionId, "Пользователь не найден");
        requireFriendship(currentUserId, companionId);

        long firstId = Math.min(currentUserId, companionId);
        long secondId = Math.max(currentUserId, companionId);

        Conversation conversation = conversationRepository
                .findByUserOneIdAndUserTwoId(firstId, secondId)
                .orElseGet(() -> createConversation(currentUser, companion, firstId));

        return toConversationResponse(conversation, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> history(Long currentUserId, Long conversationId) {
        Conversation conversation = findParticipantConversation(currentUserId, conversationId);
        return chatMessageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(ChatMessageResponse::new)
                .toList();
    }

    @Transactional
    public ChatMessageResponse send(Long currentUserId, ChatSendRequest request) {
        if (request == null || request.getConversationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите диалог");
        }

        String content = normalize(request.getContent());
        if (content == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Сообщение не может быть пустым");
        }
        if (content.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Сообщение не должно превышать 2000 символов"
            );
        }

        Conversation conversation = findParticipantConversation(currentUserId, request.getConversationId());
        User sender = findUser(currentUserId, "Ваш аккаунт не найден");

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);

        ChatMessage saved = chatMessageRepository.save(message);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        ChatMessageResponse response = new ChatMessageResponse(saved);
        messagingTemplate.convertAndSendToUser(
                conversation.getUserOne().getId().toString(),
                "/queue/messages",
                response
        );
        messagingTemplate.convertAndSendToUser(
                conversation.getUserTwo().getId().toString(),
                "/queue/messages",
                response
        );
        return response;
    }

    private Conversation createConversation(User currentUser, User companion, long firstId) {
        Conversation conversation = new Conversation();
        if (currentUser.getId().equals(firstId)) {
            conversation.setUserOne(currentUser);
            conversation.setUserTwo(companion);
        } else {
            conversation.setUserOne(companion);
            conversation.setUserTwo(currentUser);
        }

        try {
            return conversationRepository.save(conversation);
        } catch (DataIntegrityViolationException exception) {
            return conversationRepository
                    .findByUserOneIdAndUserTwoId(
                            conversation.getUserOne().getId(),
                            conversation.getUserTwo().getId()
                    )
                    .orElseThrow(() -> exception);
        }
    }

    private Conversation findParticipantConversation(Long currentUserId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Диалог не найден"
                ));

        if (!conversation.hasParticipant(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Это не ваш диалог");
        }
        return conversation;
    }

    private void requireFriendship(Long firstUserId, Long secondUserId) {
        if (friendRequestRepository.countBetweenUsers(
                firstUserId,
                secondUserId,
                FriendRequestStatus.ACCEPTED
        ) == 0) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Чат доступен только друзьям"
            );
        }
    }

    private User findUser(Long userId, String message) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, message));
    }

    private ConversationResponse toConversationResponse(Conversation conversation, Long currentUserId) {
        String lastMessage = chatMessageRepository
                .findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId())
                .map(ChatMessage::getContent)
                .orElse(null);

        return new ConversationResponse(
                conversation.getId(),
                conversation.otherParticipant(currentUserId),
                lastMessage,
                conversation.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
