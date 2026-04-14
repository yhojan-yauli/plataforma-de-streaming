package com.Streaming.service;

import com.Streaming.config.JwtService;
import com.Streaming.dto.request.*;
import com.Streaming.dto.response.AuthResponse;
import com.Streaming.dto.response.UserResponse;
import com.Streaming.entity.*;
import com.Streaming.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // 🟢 REGISTER
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(Role.USER) // ✅ IMPORTANTE
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    // 🟢 LOGIN
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    // 🟢 REFRESH TOKEN
    public AuthResponse refresh(RefreshRequest request) {

        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token inválido"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expirado");
        }

        User user = token.getUser();
        String newAccessToken = jwtService.generateToken(user);

        return buildAuthResponse(user, newAccessToken, request.getRefreshToken());
    }

    // 🔴 LOGOUT
    public void logout(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Token no encontrado"));

        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    // 🔧 CREAR REFRESH TOKEN
    private String createRefreshToken(User user) {

        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(refreshToken);

        return token;
    }

    // 🔧 BUILDER LIMPIO (CORREGIDO)
    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {


        return new AuthResponse(
                accessToken,
                refreshToken,
                new UserResponse(user) // ✅ AQUÍ estaba tu error
        );
    }
}