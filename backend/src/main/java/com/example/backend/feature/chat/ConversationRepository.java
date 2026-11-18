package com.example.backend.feature.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUserOneIdAndUserTwoId(Long userOneId, Long userTwoId);

    @Query("""
            select c from Conversation c
            where c.userOne.id = :userId or c.userTwo.id = :userId
            order by c.updatedAt desc
            """)
    List<Conversation> findAllForUser(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            delete from Conversation c
            where c.userOne.id = :userId or c.userTwo.id = :userId
            """)
    void deleteAllForUser(@Param("userId") Long userId);
}
