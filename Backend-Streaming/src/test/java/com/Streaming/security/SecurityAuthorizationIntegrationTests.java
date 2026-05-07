package com.Streaming.security;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authMeReturnsCurrentAuthenticatedUser() throws Exception {
        User user = saveUser("user@streaming.com", Role.USER, true);
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@streaming.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void userCannotAccessAdminEndpoints() throws Exception {
        User user = saveUser("user@streaming.com", Role.USER, true);
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        User admin = saveUser("admin@streaming.com", Role.ADMIN, true);
        String token = jwtService.generateToken(admin);

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void inactiveUserIsRejectedEvenWithJwt() throws Exception {
        User inactiveUser = saveUser("inactive@streaming.com", Role.USER, false);
        String token = jwtService.generateToken(inactiveUser);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    private User saveUser(String email, Role role, boolean active) {
        return userRepository.save(User.builder()
                .name("Usuario")
                .email(email)
                .password(passwordEncoder.encode("12345678"))
                .role(role)
                .active(active)
                .build());
    }
}
