package com.Streaming.security;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import com.Streaming.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // 🔍 Buscar o crear usuario
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name)
                                .password("")
                                .role(Role.USER)
                                .active(true)
                                .build()
                ));

        // 🔑 Generar JWT

        String accessToken = jwtService.generateToken(user);

        // 🔁 Redirigir a React
        String redirectUrl = "http://localhost:8081/oauth-success?token=" + accessToken;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}