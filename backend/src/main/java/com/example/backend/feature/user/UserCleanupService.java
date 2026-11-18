package com.example.backend.feature.user;

import com.example.backend.feature.chat.ChatMessageRepository;
import com.example.backend.feature.chat.ConversationRepository;
import com.example.backend.feature.friends.FriendRequestRepository;
import com.example.backend.feature.post.Post;
import com.example.backend.feature.post.PostRepository;
import com.example.backend.feature.post.comment.CommentRepository;
import com.example.backend.feature.post.likes.PostLikeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserCleanupService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;

    public UserCleanupService(
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            FriendRequestRepository friendRequestRepository,
            ChatMessageRepository chatMessageRepository,
            ConversationRepository conversationRepository
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.conversationRepository = conversationRepository;
    }

    @Transactional
    public void deleteUserAndRelatedData(User user) {
        Long userId = user.getId();

        chatMessageRepository.deleteAllForParticipant(userId);
        conversationRepository.deleteAllForUser(userId);
        friendRequestRepository.deleteAllForUser(userId);

        List<Post> posts = postRepository.findAllByAuthorIdOrderByCreatedAtDesc(userId);
        for (Post post : posts) {
            commentRepository.deleteAllByPostId(post.getId());
            postLikeRepository.deleteAllByPostId(post.getId());
        }

        commentRepository.deleteAllByAuthorId(userId);
        postLikeRepository.deleteAllByUserId(userId);
        postRepository.deleteAll(posts);
        userRepository.delete(user);
    }
}
