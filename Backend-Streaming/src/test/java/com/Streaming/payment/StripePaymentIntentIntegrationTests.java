package com.Streaming.payment;

import com.Streaming.config.JwtService;
import com.Streaming.entity.Payment;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.PaymentStatus;
import com.Streaming.entity.Role;
import com.Streaming.entity.Subscription;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.repository.PaymentRepository;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.SubscriptionPlanRepository;
import com.Streaming.repository.SubscriptionRepository;
import com.Streaming.repository.UserRepository;
import com.Streaming.service.payment.CreateStripePaymentIntentCommand;
import com.Streaming.service.payment.StripePaymentIntentGateway;
import com.Streaming.service.payment.StripePaymentIntentResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StripePaymentIntentIntegrationTests {

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

    @Autowired
    private FakeStripePaymentIntentGateway stripeGateway;

    @BeforeEach
    void cleanDatabase() {
        stripeGateway.reset();
        paymentRepository.deleteAll();
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createPaymentIntentRegistersPendingLocalPayment() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("3_MONTHS");
        User user = saveUser("checkout@streaming.com", Role.USER);
        String token = jwtService.generateToken(user);

        stripeGateway.setCreateResult(new StripePaymentIntentResult(
                "pi_create_123",
                "pi_secret_123",
                "requires_payment_method",
                "card",
                null
        ));

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s"
                                }
                                """.formatted(plan.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").isString())
                .andExpect(jsonPath("$.clientSecret").value("pi_secret_123"))
                .andExpect(jsonPath("$.externalId").value("pi_create_123"))
                .andExpect(jsonPath("$.externalStatus").value("requires_payment_method"))
                .andExpect(jsonPath("$.amount").value(plan.getPrice()))
                .andExpect(jsonPath("$.currency").value(plan.getCurrency()))
                .andExpect(jsonPath("$.plan.type").value("3_MONTHS"));

        Payment payment = paymentRepository.findByExternalId("pi_create_123").orElseThrow();

        assertThat(payment.getUser().getEmail()).isEqualTo("checkout@streaming.com");
        assertThat(payment.getPlan().getId()).isEqualTo(plan.getId());
        assertThat(payment.getMethod()).isEqualTo(PaymentMethod.CARD);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getProvider()).isEqualTo("STRIPE");
        assertThat(payment.getExternalReference()).startsWith("stripe-subscription-");
        assertThat(payment.getIdempotencyKey()).startsWith("stripe-intent-");
    }

    @Test
    void syncSucceededPaymentUpdatesStatusButWaitsForWebhookActivation() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("1_MONTH");
        User user = saveUser("success@streaming.com", Role.USER);
        String token = jwtService.generateToken(user);

        stripeGateway.setCreateResult(new StripePaymentIntentResult(
                "pi_success_123",
                "pi_secret_success",
                "requires_payment_method",
                "card",
                null
        ));

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s"
                                }
                                """.formatted(plan.getId())))
                .andExpect(status().isOk());

        Payment createdPayment = paymentRepository.findByExternalId("pi_success_123").orElseThrow();

        stripeGateway.setRetrieveResult("pi_success_123", new StripePaymentIntentResult(
                "pi_success_123",
                null,
                "succeeded",
                "card",
                null
        ));

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents/{paymentId}/sync", createdPayment.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.externalStatus").value("succeeded"))
                .andExpect(jsonPath("$.subscription").doesNotExist());

        Payment syncedPayment = paymentRepository.findById(createdPayment.getId()).orElseThrow();

        assertThat(syncedPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(syncedPayment.getSubscription()).isNull();
        assertThat(subscriptionRepository.count()).isZero();

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents/{paymentId}/sync", createdPayment.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.subscription").doesNotExist());

        Payment syncedAgain = paymentRepository.findById(createdPayment.getId()).orElseThrow();

        assertThat(syncedAgain.getSubscription()).isNull();
        assertThat(syncedAgain.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
    }

    @Test
    void syncFailedPaymentMarksTransactionAsFailedWithoutSubscription() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("12_MONTHS");
        User user = saveUser("declined@streaming.com", Role.USER);
        String token = jwtService.generateToken(user);

        stripeGateway.setCreateResult(new StripePaymentIntentResult(
                "pi_failed_123",
                "pi_secret_failed",
                "requires_payment_method",
                "card",
                null
        ));

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("""
                                {
                                  "planId": "%s"
                                }
                                """.formatted(plan.getId())))
                .andExpect(status().isOk());

        Payment createdPayment = paymentRepository.findByExternalId("pi_failed_123").orElseThrow();

        stripeGateway.setRetrieveResult("pi_failed_123", new StripePaymentIntentResult(
                "pi_failed_123",
                null,
                "requires_payment_method",
                "card",
                "Tu tarjeta fue rechazada"
        ));

        mockMvc.perform(post("/api/subscriptions/stripe/payment-intents/{paymentId}/sync", createdPayment.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.externalStatus").value("requires_payment_method"))
                .andExpect(jsonPath("$.externalStatusDetail").value("Tu tarjeta fue rechazada"))
                .andExpect(jsonPath("$.subscription").doesNotExist());

        Payment failedPayment = paymentRepository.findById(createdPayment.getId()).orElseThrow();

        assertThat(failedPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(failedPayment.getSubscription()).isNull();
        assertThat(subscriptionRepository.count()).isZero();
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

    @TestConfiguration
    static class StripeGatewayTestConfig {

        @Bean
        @Primary
        FakeStripePaymentIntentGateway stripePaymentIntentGateway() {
            return new FakeStripePaymentIntentGateway();
        }
    }

    static class FakeStripePaymentIntentGateway implements StripePaymentIntentGateway {

        private StripePaymentIntentResult createResult;
        private final Map<String, StripePaymentIntentResult> retrieveResults = new HashMap<>();

        @Override
        public StripePaymentIntentResult createPaymentIntent(CreateStripePaymentIntentCommand command) {
            if (createResult == null) {
                throw new IllegalStateException("No create result configured for Stripe test gateway");
            }

            return createResult;
        }

        @Override
        public StripePaymentIntentResult getPaymentIntent(String externalId) {
            StripePaymentIntentResult result = retrieveResults.get(externalId);

            if (result == null) {
                throw new IllegalStateException("No retrieve result configured for externalId " + externalId);
            }

            return result;
        }

        void setCreateResult(StripePaymentIntentResult createResult) {
            this.createResult = createResult;
        }

        void setRetrieveResult(String externalId, StripePaymentIntentResult result) {
            retrieveResults.put(externalId, result);
        }

        void reset() {
            createResult = null;
            retrieveResults.clear();
        }
    }
}
