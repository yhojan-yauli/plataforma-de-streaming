package com.Streaming.user;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import com.Streaming.repository.ContentRepository;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.UserMyListRepository;
import com.Streaming.repository.UserRepository;
import com.Streaming.repository.WatchHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserAccountPhase3IntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private UserMyListRepository userMyListRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void cleanDatabase() {
        watchHistoryRepository.deleteAll();
        userMyListRepository.deleteAll();
        contentRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void profileCanBeUpdatedPasswordChangedAndVerificationRequested() throws Exception {
        User user = saveUser("profile@streaming.com");
        String token = jwtService.generateToken(user);

        mockMvc.perform(put("/api/user/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Nombre Actualizado"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nombre Actualizado"));

        mockMvc.perform(put("/api/user/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "currentPassword": "12345678",
                                  "newPassword": "87654321"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Contraseña actualizada"));

        mockMvc.perform(post("/api/user/request-verification")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Solicitud de verificación registrada"));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getName()).isEqualTo("Nombre Actualizado");
        assertThat(passwordEncoder.matches("87654321", updatedUser.getPassword())).isTrue();
        assertThat(updatedUser.getVerificationToken()).isNotBlank();
    }

    @Test
    void myListAndContinueWatchingFlowWorks() throws Exception {
        User user = saveUser("library@streaming.com");
        Content content = contentRepository.save(Content.builder()
                .title("Archivo 7")
                .description("Descripcion")
                .type(ContentType.MOVIE)
                .genre("[\"Acción\"]")
                .year(2024)
                .duration(110)
                .posterUrl("https://example.com/poster")
                .bannerUrl("https://example.com/banner")
                .videoUrl("https://example.com/video")
                .trailerUrl("https://example.com/trailer")
                .active(true)
                .views(0)
                .build());

        String token = jwtService.generateToken(user);

        mockMvc.perform(post("/api/user/my-list/{contentId}", content.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Contenido agregado a tu lista"));

        mockMvc.perform(get("/api/user/my-list")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(content.getId()));

        mockMvc.perform(put("/api/user/history/{contentId}", content.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "progress": 35
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contentId").value(content.getId()))
                .andExpect(jsonPath("$.progress").value(35));

        mockMvc.perform(get("/api/user/continue-watching")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contentId").value(content.getId()));

        mockMvc.perform(delete("/api/user/my-list/{contentId}", content.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Contenido eliminado de tu lista"));
    }

    private User saveUser(String email) {
        return userRepository.save(User.builder()
                .name("Usuario")
                .email(email)
                .password(passwordEncoder.encode("12345678"))
                .role(Role.USER)
                .active(true)
                .build());
    }
}
