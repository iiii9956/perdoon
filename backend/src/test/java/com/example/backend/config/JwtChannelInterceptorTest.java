package com.example.backend.config;

import com.example.backend.feature.auth.jwt.JwtService;
import com.example.backend.feature.auth.logout.RevokedTokenService;
import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtChannelInterceptorTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private RevokedTokenService revokedTokenService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JwtChannelInterceptor interceptor;

    @Test
    void setsUserOnConnect() {
        when(jwtService.isTokenValid("good-token")).thenReturn(true);
        when(revokedTokenService.isTokenRevoked("good-token")).thenReturn(false);
        when(jwtService.getUserIdFromToken("good-token")).thenReturn(7L);

        User user = mock(User.class);
        when(user.getId()).thenReturn(7L);
        when(user.getRole()).thenReturn(Role.USER);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer good-token");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        interceptor.preSend(message, null);

        StompHeaderAccessor result = StompHeaderAccessor.wrap(message);
        assertEquals("7", result.getUser().getName());
    }

    @Test
    void rejectsInvalidToken() {
        when(jwtService.isTokenValid("bad")).thenReturn(false);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("token", "bad");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, null));
    }
}
