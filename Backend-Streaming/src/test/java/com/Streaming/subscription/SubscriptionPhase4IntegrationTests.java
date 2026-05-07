package com.Streaming.subscription;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.Role;
import com.Streaming.entity.Subscription;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.repository.CommentRepository;
import com.Streaming.repository.ContentRepository;
import com.Streaming.repository.EpisodeRepository;
import com.Streaming.repository.RatingRepository;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.SubscriptionPlanRepository;
import com.Streaming.repository.SubscriptionRepository;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubscriptionPhase4IntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserMyListRepository userMyListRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @BeforeEach
    void cleanDatabase() {
        watchHistoryRepository.deleteAll();
        userMyListRepository.deleteAll();
        commentRepository.deleteAll();
        ratingRepository.deleteAll();
        episodeRepository.deleteAll();
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        contentRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void plansAndProportionalEndpointsReturnRealDomainData() throws Exception {
        mockMvc.perform(get("/api/subscriptions/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("1_MONTH"))
                .andExpect(jsonPath("$[1].type").value("3_MONTHS"))
                .andExpect(jsonPath("$[2].type").value("12_MONTHS"));

        SubscriptionPlan threeMonthsPlan = subscriptionPlanRepository.findByTypeAndActiveTrue("3_MONTHS").orElseThrow();

        mockMvc.perform(post("/api/subscriptions/calculate-proportional")
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s",
                                  "availableAmount": 25
                                }
                                """.formatted(threeMonthsPlan.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(threeMonthsPlan.getId()))
                .andExpect(jsonPath("$.days").value(45))
                .andExpect(jsonPath("$.hours").value(0))
                .andExpect(jsonPath("$.coveredPercentage").value(50.0));
    }

    @Test
    void activateAndCurrentSubscriptionEndpointsManageRenewalAndExpiration() throws Exception {
        mockMvc.perform(get("/api/subscriptions/plans"))
                .andExpect(status().isOk());

        SubscriptionPlan oneMonthPlan = subscriptionPlanRepository.findByTypeAndActiveTrue("1_MONTH").orElseThrow();
        SubscriptionPlan threeMonthsPlan = subscriptionPlanRepository.findByTypeAndActiveTrue("3_MONTHS").orElseThrow();

        User user = saveUser("subscriber@streaming.com");
        String token = jwtService.generateToken(user);

        mockMvc.perform(post("/api/subscriptions/activate")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s",
                                  "paymentMethod": "CARD"
                                }
                                """.formatted(oneMonthPlan.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.type").value("1_MONTH"))
                .andExpect(jsonPath("$.active").value(true));

        Subscription createdSubscription = subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId()).orElseThrow();
        LocalDateTime firstEndDate = createdSubscription.getEndDate();

        mockMvc.perform(post("/api/subscriptions/activate")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s",
                                  "paymentMethod": "YAPE"
                                }
                                """.formatted(threeMonthsPlan.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.type").value("3_MONTHS"))
                .andExpect(jsonPath("$.paymentMethod").value("YAPE"));

        Subscription renewedSubscription = subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId()).orElseThrow();
        assertThat(renewedSubscription.getEndDate()).isAfter(firstEndDate);
        assertThat(renewedSubscription.getAmountPaid()).isEqualTo(70.0);

        mockMvc.perform(get("/api/subscriptions/current")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.type").value("3_MONTHS"))
                .andExpect(jsonPath("$.active").value(true));

        renewedSubscription.setEndDate(LocalDateTime.now().minusDays(1));
        subscriptionRepository.save(renewedSubscription);

        mockMvc.perform(get("/api/subscriptions/current")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertThat(subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId())).isEmpty();
    }

    @Test
    void playbackUrlsAreProtectedByActiveSubscription() throws Exception {
        mockMvc.perform(get("/api/subscriptions/plans"))
                .andExpect(status().isOk());

        SubscriptionPlan oneMonthPlan = subscriptionPlanRepository.findByTypeAndActiveTrue("1_MONTH").orElseThrow();
        Content content = contentRepository.save(Content.builder()
                .title("Playback seguro")
                .description("Contenido protegido")
                .type(ContentType.MOVIE)
                .genre("[\"Drama\"]")
                .year(2024)
                .duration(115)
                .posterUrl("https://example.com/poster")
                .bannerUrl("https://example.com/banner")
                .videoUrl("https://example.com/video-protegido")
                .trailerUrl("https://example.com/trailer")
                .active(true)
                .views(0)
                .build());

        mockMvc.perform(get("/api/content/{id}", content.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoUrl").doesNotExist());

        User user = saveUser("viewer@streaming.com");
        String token = jwtService.generateToken(user);

        mockMvc.perform(post("/api/subscriptions/activate")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s",
                                  "paymentMethod": "CARD"
                                }
                                """.formatted(oneMonthPlan.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/content/{id}", content.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoUrl").value("https://example.com/video-protegido"));
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
