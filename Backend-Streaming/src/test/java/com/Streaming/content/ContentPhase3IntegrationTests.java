package com.Streaming.content;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import com.Streaming.entity.Episode;
import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import com.Streaming.repository.CommentRepository;
import com.Streaming.repository.ContentRepository;
import com.Streaming.repository.EpisodeRepository;
import com.Streaming.repository.RatingRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContentPhase3IntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void cleanDatabase() {
        commentRepository.deleteAll();
        ratingRepository.deleteAll();
        episodeRepository.deleteAll();
        contentRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void browseEndpointReturnsOnlyActiveCatalogWithFilters() throws Exception {
        contentRepository.save(buildContent("Horizonte Final", ContentType.MOVIE, true, 2024, "[\"Ciencia Ficción\",\"Drama\"]"));
        contentRepository.save(buildContent("Horizonte Oculto", ContentType.MOVIE, false, 2024, "[\"Ciencia Ficción\"]"));

        mockMvc.perform(get("/api/content/browse")
                        .param("search", "Horizonte")
                        .param("type", "MOVIE")
                        .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Horizonte Final"))
                .andExpect(jsonPath("$.content[0].active").value(true));
    }

    @Test
    void episodesEndpointReturnsSeriesEpisodesInOrder() throws Exception {
        Content series = contentRepository.save(buildContent("Mision Atlas", ContentType.SERIES, true, 2023, "[\"Drama\"]"));

        episodeRepository.save(Episode.builder()
                .content(series)
                .season(1)
                .episode(2)
                .title("Segundo episodio")
                .description("Capitulo dos")
                .duration(40)
                .videoUrl("https://example.com/ep-2")
                .thumbnailUrl("https://example.com/thumb-2")
                .build());

        episodeRepository.save(Episode.builder()
                .content(series)
                .season(1)
                .episode(1)
                .title("Primer episodio")
                .description("Capitulo uno")
                .duration(42)
                .videoUrl("https://example.com/ep-1")
                .thumbnailUrl("https://example.com/thumb-1")
                .build());

        mockMvc.perform(get("/api/content/{id}/episodes", series.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Primer episodio"))
                .andExpect(jsonPath("$[1].title").value("Segundo episodio"));
    }

    @Test
    void authenticatedUserCanCommentAndUpdateRating() throws Exception {
        User user = saveUser("viewer@streaming.com");
        Content content = contentRepository.save(buildContent("Ciudad Solar", ContentType.MOVIE, true, 2022, "[\"Drama\"]"));
        String token = jwtService.generateToken(user);

        mockMvc.perform(post("/api/content/{id}/comments", content.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "text": "Muy buena pelicula",
                                  "rating": 5
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("Usuario"))
                .andExpect(jsonPath("$.positive").value(true));

        mockMvc.perform(post("/api/content/{id}/rate", content.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "rating": 4
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Valoración registrada"));

        mockMvc.perform(get("/api/content/{id}", content.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4.0));
    }

    private Content buildContent(String title, ContentType type, boolean active, int year, String genre) {
        return Content.builder()
                .title(title)
                .description("Descripcion de prueba")
                .type(type)
                .genre(genre)
                .year(year)
                .duration(120)
                .posterUrl("https://example.com/poster")
                .bannerUrl("https://example.com/banner")
                .videoUrl("https://example.com/video")
                .trailerUrl("https://example.com/trailer")
                .active(active)
                .views(25)
                .build();
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
