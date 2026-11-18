package com.example.backend.config;

import com.example.backend.feature.auth.jwt.JwtService;
import com.example.backend.feature.auth.logout.RevokedTokenService;
import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class JwtChannelInterceptor implements org.springframework.messaging.support.ChannelInterceptor {

    private final JwtService jwtService;
    private final RevokedTokenService revokedTokenService;
    private final UserRepository userRepository;

    public JwtChannelInterceptor(
            JwtService jwtService,
            RevokedTokenService revokedTokenService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.revokedTokenService = revokedTokenService;
        this.userRepository = userRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
            return message;
        }

        if ((StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand()))
                && accessor.getUser() == null) {
            throw new MessageDeliveryException("Необходима авторизация");
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor);
        if (token == null || !jwtService.isTokenValid(token) || revokedTokenService.isTokenRevoked(token)) {
            throw new MessageDeliveryException("Недействительный токен");
        }

        Long userId = jwtService.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new MessageDeliveryException("Пользователь не найден"));

        if (user.getRole() == null) {
            throw new MessageDeliveryException("У пользователя нет роли");
        }

        Role role = user.getRole();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getId().toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
        accessor.setUser(authentication);
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        String tokenHeader = accessor.getFirstNativeHeader("token");
        if (tokenHeader != null && !tokenHeader.isBlank()) {
            return tokenHeader.trim();
        }

        Map<String, Object> attributes = accessor.getSessionAttributes();
        if (attributes == null) {
            return null;
        }
        Object token = attributes.get("token");
        if (token == null || token.toString().isBlank()) {
            return null;
        }
        return token.toString().trim();
    }
}
