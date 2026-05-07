package com.Streaming.payment;

import com.Streaming.entity.Payment;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.PaymentStatus;
import com.Streaming.entity.Role;
import com.Streaming.entity.StripeWebhookEvent;
import com.Streaming.entity.StripeWebhookEventStatus;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.repository.PaymentRepository;
import com.Streaming.repository.RefreshTokenRepository;
import com.Streaming.repository.StripeWebhookEventRepository;
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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StripeWebhookIntegrationTests {

    private static final String WEBHOOK_SECRET = "whsec_test_prepared_stripe";

    @Autowired
    private MockMvc mockMvc;

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
    private StripeWebhookEventRepository stripeWebhookEventRepository;

    @BeforeEach
    void cleanDatabase() {
        stripeWebhookEventRepository.deleteAll();
        paymentRepository.deleteAll();
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void succeededWebhookActivatesSubscriptionAndIgnoresDuplicateDelivery() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("3_MONTHS");
        User user = saveUser("webhook-success@streaming.com", Role.USER);
        String localPaymentId = "pay_local_success";
        String externalReference = "stripe-subscription-" + localPaymentId;

        paymentRepository.save(Payment.builder()
                .id(localPaymentId)
                .user(user)
                .plan(plan)
                .amount(plan.getPrice())
                .currency(plan.getCurrency())
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PENDING)
                .provider("STRIPE")
                .externalReference(externalReference)
                .idempotencyKey("stripe-intent-" + localPaymentId)
                .build());

        String eventId = "evt_success_001";
        String payload = paymentIntentEventPayload(
                eventId,
                "payment_intent.succeeded",
                "pi_webhook_success_001",
                5000L,
                "pen",
                "succeeded",
                Map.of(
                        "localPaymentId", localPaymentId,
                        "userId", user.getId(),
                        "planId", plan.getId(),
                        "reference", externalReference
                ),
                null
        );

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType("application/json")
                        .header("Stripe-Signature", signatureFor(payload))
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Evento Stripe procesado"));

        Payment updatedPayment = paymentRepository.findById(localPaymentId).orElseThrow();
        StripeWebhookEvent webhookEvent = stripeWebhookEventRepository.findById(eventId).orElseThrow();
        LocalDateTime endDateAfterFirstDelivery = updatedPayment.getSubscription().getEndDate();

        assertThat(updatedPayment.getExternalId()).isEqualTo("pi_webhook_success_001");
        assertThat(updatedPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(updatedPayment.getSubscription()).isNotNull();
        assertThat(updatedPayment.getSubscription().getAmountPaid()).isEqualTo(plan.getPrice());
        assertThat(webhookEvent.getStatus()).isEqualTo(StripeWebhookEventStatus.PROCESSED);
        assertThat(webhookEvent.getAttemptCount()).isEqualTo(1);

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType("application/json")
                        .header("Stripe-Signature", signatureFor(payload))
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Evento Stripe ya procesado"));

        Payment duplicatedDeliveryPayment = paymentRepository.findById(localPaymentId).orElseThrow();

        assertThat(duplicatedDeliveryPayment.getSubscription()).isNotNull();
        assertThat(duplicatedDeliveryPayment.getSubscription().getEndDate()).isEqualTo(endDateAfterFirstDelivery);
        assertThat(duplicatedDeliveryPayment.getSubscription().getAmountPaid()).isEqualTo(plan.getPrice());
        assertThat(stripeWebhookEventRepository.findById(eventId).orElseThrow().getAttemptCount()).isEqualTo(1);
    }

    @Test
    void succeededWebhookRecoversMissingLocalPaymentFromMetadata() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("1_MONTH");
        User user = saveUser("webhook-recover@streaming.com", Role.USER);

        String payload = paymentIntentEventPayload(
                "evt_recover_001",
                "payment_intent.succeeded",
                "pi_webhook_recover_001",
                2000L,
                "pen",
                "succeeded",
                Map.of(
                        "localPaymentId", "pay_recovered_from_webhook",
                        "userId", user.getId(),
                        "planId", plan.getId(),
                        "reference", "stripe-subscription-pay_recovered_from_webhook"
                ),
                null
        );

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType("application/json")
                        .header("Stripe-Signature", signatureFor(payload))
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Evento Stripe procesado"));

        Payment recoveredPayment = paymentRepository.findById("pay_recovered_from_webhook").orElseThrow();

        assertThat(recoveredPayment.getExternalId()).isEqualTo("pi_webhook_recover_001");
        assertThat(recoveredPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(recoveredPayment.getAmount()).isEqualTo(20.0);
        assertThat(recoveredPayment.getSubscription()).isNotNull();
        assertThat(recoveredPayment.getSubscription().isActive()).isTrue();
    }

    @Test
    void failedWebhookMarksPaymentAsFailedWithoutActivatingSubscription() throws Exception {
        SubscriptionPlan plan = seedPlansAndGet("12_MONTHS");
        User user = saveUser("webhook-failed@streaming.com", Role.USER);
        String localPaymentId = "pay_local_failed";

        paymentRepository.save(Payment.builder()
                .id(localPaymentId)
                .user(user)
                .plan(plan)
                .amount(plan.getPrice())
                .currency(plan.getCurrency())
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PENDING)
                .provider("STRIPE")
                .externalReference("stripe-subscription-" + localPaymentId)
                .idempotencyKey("stripe-intent-" + localPaymentId)
                .build());

        String payload = paymentIntentEventPayload(
                "evt_failed_001",
                "payment_intent.payment_failed",
                "pi_webhook_failed_001",
                16000L,
                "pen",
                "requires_payment_method",
                Map.of(
                        "localPaymentId", localPaymentId,
                        "userId", user.getId(),
                        "planId", plan.getId(),
                        "reference", "stripe-subscription-" + localPaymentId
                ),
                "Tu tarjeta fue rechazada"
        );

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType("application/json")
                        .header("Stripe-Signature", signatureFor(payload))
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Evento Stripe procesado"));

        Payment failedPayment = paymentRepository.findById(localPaymentId).orElseThrow();

        assertThat(failedPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(failedPayment.getExternalStatus()).isEqualTo("requires_payment_method");
        assertThat(failedPayment.getExternalStatusDetail()).isEqualTo("Tu tarjeta fue rechazada");
        assertThat(failedPayment.getSubscription()).isNull();
        assertThat(subscriptionRepository.count()).isZero();
    }

    @Test
    void webhookRejectsInvalidSignature() throws Exception {
        String payload = paymentIntentEventPayload(
                "evt_invalid_signature",
                "payment_intent.succeeded",
                "pi_invalid_signature",
                2000L,
                "pen",
                "succeeded",
                Map.of(),
                null
        );

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType("application/json")
                        .header("Stripe-Signature", "t=123,v1=invalid")
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La firma del webhook de Stripe no es válida"));

        assertThat(stripeWebhookEventRepository.count()).isZero();
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

    private String paymentIntentEventPayload(
            String eventId,
            String eventType,
            String paymentIntentId,
            long amount,
            String currency,
            String status,
            Map<String, String> metadata,
            String lastErrorMessage
    ) {
        long createdAt = System.currentTimeMillis() / 1000L;
        String metadataJson = metadata.entrySet().stream()
                .map(entry -> "\"%s\":\"%s\"".formatted(entry.getKey(), entry.getValue()))
                .collect(Collectors.joining(","));

        String lastPaymentErrorJson = lastErrorMessage == null
                ? ""
                : """
                    ,
                    "last_payment_error": {
                      "message": "%s"
                    }
                """.formatted(lastErrorMessage);

        return """
                {
                  "id": "%s",
                  "object": "event",
                  "api_version": "2025-09-30.clover",
                  "created": %d,
                  "data": {
                    "object": {
                      "id": "%s",
                      "object": "payment_intent",
                      "amount": %d,
                      "currency": "%s",
                      "status": "%s",
                      "payment_method_types": ["card"],
                      "metadata": {%s}%s
                    }
                  },
                  "livemode": false,
                  "pending_webhooks": 1,
                  "request": {
                    "id": "req_%s",
                    "idempotency_key": null
                  },
                  "type": "%s"
                }
                """.formatted(
                eventId,
                createdAt,
                paymentIntentId,
                amount,
                currency,
                status,
                metadataJson,
                lastPaymentErrorJson,
                eventId,
                eventType
        );
    }

    private String signatureFor(String payload) throws Exception {
        long timestamp = System.currentTimeMillis() / 1000L;
        String signedPayload = timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = HexFormat.of().formatHex(mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8)));
        return "t=%d,v1=%s".formatted(timestamp, signature);
    }
}
