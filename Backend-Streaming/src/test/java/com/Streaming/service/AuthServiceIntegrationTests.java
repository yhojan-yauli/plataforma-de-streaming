package com.Streaming.service;

import com.Streaming.dto.request.RefreshRequest;
import com.Streaming.dto.request.RegisterRequest;
import com.Streaming.dto.response.AuthResponse;
import com.Streaming.entity.RefreshToken;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceIntegrationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void cleanDatabase() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void refreshRotatesRefreshTokenAndRevokesPreviousOne() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("Usuario Test");
        registerRequest.setEmail("test@streaming.com");
        registerRequest.setPassword("12345678");

        AuthResponse registeredSession = authService.register(registerRequest);

        RefreshRequest refreshRequest = new RefreshRequest();
        refreshRequest.setRefreshToken(registeredSession.getRefreshToken());

        AuthResponse refreshedSession = authService.refresh(refreshRequest);

        RefreshToken previousToken = refreshTokenRepository.findByToken(registeredSession.getRefreshToken()).orElseThrow();
        RefreshToken newToken = refreshTokenRepository.findByToken(refreshedSession.getRefreshToken()).orElseThrow();

        assertTrue(previousToken.isRevoked());
        assertNotEquals(registeredSession.getRefreshToken(), refreshedSession.getRefreshToken());
        assertEquals("test@streaming.com", refreshedSession.getUser().getEmail());
        assertTrue(newToken.getExpiresAt().isAfter(newToken.getCreatedAt()));
    }
}
