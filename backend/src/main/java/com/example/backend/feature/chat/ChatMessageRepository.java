package com.example.backend.feature.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<ChatMessage> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from ChatMessage m
            where m.conversation.userOne.id = :userId
               or m.conversation.userTwo.id = :userId
            """)
    void deleteAllForParticipant(@Param("userId") Long userId);
}
