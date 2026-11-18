package com.example.backend.feature.chat;

import com.example.backend.feature.chat.dto.ChatMessageResponse;
import com.example.backend.feature.chat.dto.ConversationResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<ConversationResponse> list(@AuthenticationPrincipal String userId) {
        return chatService.list(Long.valueOf(userId));
    }

    @PostMapping("/with/{userId}")
    public ConversationResponse open(
            @PathVariable Long userId,
            @AuthenticationPrincipal String currentUserId
    ) {
        return chatService.open(Long.valueOf(currentUserId), userId);
    }

    @GetMapping("/{conversationId}/messages")
    public List<ChatMessageResponse> history(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal String userId
    ) {
        return chatService.history(Long.valueOf(userId), conversationId);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ChatMessageResponse> send(
            @PathVariable Long conversationId,
            @RequestBody com.example.backend.feature.chat.dto.ChatSendRequest request,
            @AuthenticationPrincipal String userId
    ) {
        request.setConversationId(conversationId);

        return ResponseEntity.ok(
                chatService.send(Long.valueOf(userId), request)
        );
    }
}
