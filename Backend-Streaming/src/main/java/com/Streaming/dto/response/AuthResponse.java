package com.Streaming.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private LocalDateTime refreshTokenExpiresAt;
    private UserResponse user;
}
