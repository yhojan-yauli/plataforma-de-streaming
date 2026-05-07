package com.Streaming.service;

import com.Streaming.config.JwtService;
import com.Streaming.dto.request.*;
import com.Streaming.dto.response.AuthResponse;
import com.Streaming.dto.response.UserResponse;
import com.Streaming.exception.ConflictException;
import com.Streaming.exception.ResourceNotFoundException;
import com.Streaming.exception.UnauthorizedException;
import com.Streaming.entity.*;
import com.Streaming.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("El correo ya está registrado");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Tu cuenta está desactivada");
        }

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refresh(RefreshRequest request) {

        RefreshToken currentToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token inválido"));

        if (currentToken.isRevoked() || currentToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expirado");
        }

        User user = currentToken.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("Tu cuenta está desactivada");
        }

        revokeToken(currentToken);

        String newAccessToken = jwtService.generateToken(user);
        RefreshToken newRefreshToken = createRefreshToken(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    public void logout(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token inválido"));

        revokeToken(token);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return new UserResponse(user);
    }

    private RefreshToken createRefreshToken(User user) {

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private void revokeToken(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, RefreshToken refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                jwtService.extractExpiration(accessToken),
                refreshToken.getExpiresAt(),
                new UserResponse(user)
        );
    }
}
