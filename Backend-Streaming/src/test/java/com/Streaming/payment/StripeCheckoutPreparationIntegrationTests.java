package com.Streaming.payment;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Payment;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.PaymentStatus;
import com.Streaming.entity.Role;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.repository.PaymentRepository;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.SubscriptionPlanRepository;
import com.Streaming.repository.SubscriptionRepository;
import com.Streaming.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StripeCheckoutPreparationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @BeforeEach
    void cleanDatabase() {
        paymentRepository.deleteAll();
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void stripeConfigReturnsPreparedCheckoutConfiguration() throws Exception {
        User user = saveUser("stripe-config@streaming.com", Role.USER);
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/subscriptions/stripe/config")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("STRIPE"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.publishableKey").value("pk_test_prepared_stripe"))
                .andExpect(jsonPath("$.currency").value("PEN"));
    }

    @Test
    void adminCanListRegisteredStripePayments() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("12_MONTHS");
        User user = saveUser("history@streaming.com", Role.USER);

        paymentRepository.save(Payment.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .plan(plan)
                .amount(plan.getPrice())
                .currency(plan.getCurrency())
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.SUCCESS)
                .provider("STRIPE")
                .providerMethod("card")
                .externalId("pi_test_123")
                .externalStatus("succeeded")
                .externalReference("internal-ref-123")
                .idempotencyKey("idem-123")
                .createdAt(LocalDateTime.now())
                .build());

        User admin = saveUser("admin-payments@streaming.com", Role.ADMIN);
        String adminToken = jwtService.generateToken(admin);

        mockMvc.perform(get("/api/admin/payments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].userEmail").value("history@streaming.com"))
                .andExpect(jsonPath("$.content[0].status").value("SUCCESS"))
                .andExpect(jsonPath("$.content[0].provider").value("STRIPE"))
                .andExpect(jsonPath("$.content[0].externalId").value("pi_test_123"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    private SubscriptionPlan seedPlansAndGet(String type) throws Exception {
        mockMvc.perform(get("/api/subscriptions/plans"))
                .andExpect(status().isOk());

        return subscriptionPlanRepository.findByTypeAndActiveTrue(type).orElseThrow();
    }

    private User saveUser(String email, Role role) {
        return userRepository.save(User.builder()
                .name("Usuario")
                .email(email)
                .password(passwordEncoder.encode("12345678"))
                .role(role)
                .active(true)
                .build());
    }
}
