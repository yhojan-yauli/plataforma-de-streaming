package com.Streaming.service;

import com.Streaming.dto.request.CreateStripePaymentIntentRequest;
import com.Streaming.dto.response.PaymentResponse;
import com.Streaming.dto.response.StripePaymentIntentResponse;
import com.Streaming.entity.Payment;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.PaymentStatus;
import com.Streaming.entity.Subscription;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.exception.BadRequestException;
import com.Streaming.exception.ResourceNotFoundException;
import com.Streaming.repository.PaymentRepository;
import com.Streaming.repository.SubscriptionPlanRepository;
import com.Streaming.repository.UserRepository;
import com.Streaming.service.payment.CreateStripePaymentIntentCommand;
import com.Streaming.service.payment.StripePaymentIntentGateway;
import com.Streaming.service.payment.StripePaymentIntentResult;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StripePaymentService {

    private static final String STRIPE_PROVIDER = "STRIPE";
    private static final String CARD_PROVIDER_METHOD = "card";

    private final PaymentRepository paymentRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final StripePaymentIntentGateway stripePaymentIntentGateway;

    public StripePaymentIntentResponse createPaymentIntent(String email, CreateStripePaymentIntentRequest request) {
        User user = getUserByEmail(email);
        SubscriptionPlan plan = getActivePlan(request.getPlanId());

        String paymentId = UUID.randomUUID().toString();
        String externalReference = "stripe-subscription-" + paymentId;
        String idempotencyKey = "stripe-intent-" + paymentId;

        StripePaymentIntentResult stripePaymentIntent = stripePaymentIntentGateway.createPaymentIntent(
                new CreateStripePaymentIntentCommand(
                        toMinorUnits(plan.getPrice()),
                        normalizeCurrency(plan.getCurrency()),
                        user.getEmail(),
                        "Suscripción " + plan.getType(),
                        Map.of(
                                "localPaymentId", paymentId,
                                "userId", user.getId(),
                                "planId", plan.getId(),
                                "reference", externalReference
                        ),
                        idempotencyKey
                )
        );

        Payment payment = paymentRepository.save(Payment.builder()
                .id(paymentId)
                .user(user)
                .plan(plan)
                .amount(plan.getPrice())
                .currency(normalizeCurrency(plan.getCurrency()))
                .method(PaymentMethod.CARD)
                .status(resolvePaymentStatus(stripePaymentIntent.status(), stripePaymentIntent.statusDetail()))
                .provider(STRIPE_PROVIDER)
                .providerMethod(StringUtils.hasText(stripePaymentIntent.paymentMethodType()) ? stripePaymentIntent.paymentMethodType() : CARD_PROVIDER_METHOD)
                .externalId(stripePaymentIntent.id())
                .externalStatus(stripePaymentIntent.status())
                .externalStatusDetail(stripePaymentIntent.statusDetail())
                .externalReference(externalReference)
                .idempotencyKey(idempotencyKey)
                .build());

        return StripePaymentIntentResponse.builder()
                .paymentId(payment.getId())
                .clientSecret(stripePaymentIntent.clientSecret())
                .externalId(payment.getExternalId())
                .externalStatus(payment.getExternalStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .plan(subscriptionService.toPlanResponse(plan))
                .build();
    }

    public PaymentResponse syncPaymentIntent(String email, String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .filter(existingPayment -> existingPayment.getUser() != null && email.equals(existingPayment.getUser().getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        if (!STRIPE_PROVIDER.equalsIgnoreCase(payment.getProvider())) {
            throw new BadRequestException("El pago no pertenece a Stripe");
        }

        if (!StringUtils.hasText(payment.getExternalId())) {
            throw new BadRequestException("El pago no tiene identificador externo asociado");
        }

        StripePaymentIntentResult stripePaymentIntent = stripePaymentIntentGateway.getPaymentIntent(payment.getExternalId());

        applyStripeState(
                payment,
                stripePaymentIntent.status(),
                stripePaymentIntent.statusDetail(),
                stripePaymentIntent.paymentMethodType(),
                false
        );

        return toPaymentResponse(paymentRepository.save(payment));
    }

    public Payment reconcileWebhookPaymentIntent(PaymentIntent paymentIntent) {
        Payment payment = resolvePaymentFromWebhook(paymentIntent);
        Map<String, String> metadata = paymentIntent.getMetadata() != null ? paymentIntent.getMetadata() : Collections.emptyMap();

        payment.setUser(payment.getUser() != null ? payment.getUser() : getUserById(metadata.get("userId")));
        payment.setPlan(payment.getPlan() != null ? payment.getPlan() : getPlanById(metadata.get("planId")));
        payment.setAmount(resolveAmount(paymentIntent.getAmount(), payment.getAmount()));
        payment.setCurrency(normalizeCurrency(StringUtils.hasText(paymentIntent.getCurrency()) ? paymentIntent.getCurrency() : payment.getCurrency()));
        payment.setMethod(PaymentMethod.CARD);
        payment.setProvider(STRIPE_PROVIDER);
        payment.setProviderMethod(resolvePaymentMethodType(paymentIntent, payment.getProviderMethod()));
        payment.setExternalId(paymentIntent.getId());

        if (!StringUtils.hasText(payment.getExternalReference())) {
            payment.setExternalReference(StringUtils.hasText(metadata.get("reference"))
                    ? metadata.get("reference")
                    : "stripe-webhook-" + paymentIntent.getId());
        }

        if (!StringUtils.hasText(payment.getIdempotencyKey())) {
            payment.setIdempotencyKey("stripe-webhook-recovered-" + paymentIntent.getId());
        }

        applyStripeState(
                payment,
                paymentIntent.getStatus(),
                paymentIntent.getLastPaymentError() != null ? paymentIntent.getLastPaymentError().getMessage() : null,
                resolvePaymentMethodType(paymentIntent, payment.getProviderMethod()),
                true
        );

        return paymentRepository.save(payment);
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod() != null ? payment.getMethod().name() : null)
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .provider(payment.getProvider())
                .providerMethod(payment.getProviderMethod())
                .externalId(payment.getExternalId())
                .externalStatus(payment.getExternalStatus())
                .externalStatusDetail(payment.getExternalStatusDetail())
                .createdAt(payment.getCreatedAt())
                .subscription(payment.getSubscription() != null ? subscriptionService.toSubscriptionResponse(payment.getSubscription()) : null)
                .build();
    }

    private void applyStripeState(
            Payment payment,
            String externalStatus,
            String externalStatusDetail,
            String paymentMethodType,
            boolean activateSubscription
    ) {
        payment.setExternalStatus(externalStatus);
        payment.setExternalStatusDetail(externalStatusDetail);
        payment.setProviderMethod(StringUtils.hasText(paymentMethodType) ? paymentMethodType : payment.getProviderMethod());
        payment.setStatus(resolvePaymentStatus(externalStatus, externalStatusDetail));

        if (activateSubscription && payment.getStatus() == PaymentStatus.SUCCESS && payment.getSubscription() == null) {
            Subscription subscription = subscriptionService.activatePaidSubscription(
                    payment.getUser(),
                    payment.getPlan(),
                    PaymentMethod.CARD,
                    payment.getAmount()
            );
            payment.setSubscription(subscription);
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private User getUserById(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new BadRequestException("Stripe no envió el usuario asociado al pago");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para reconciliar el pago"));
    }

    private SubscriptionPlan getActivePlan(String planId) {
        return subscriptionPlanRepository.findByIdAndActiveTrue(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan no encontrado"));
    }

    private SubscriptionPlan getPlanById(String planId) {
        if (!StringUtils.hasText(planId)) {
            throw new BadRequestException("Stripe no envió el plan asociado al pago");
        }

        return subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan no encontrado para reconciliar el pago"));
    }

    private Payment resolvePaymentFromWebhook(PaymentIntent paymentIntent) {
        Map<String, String> metadata = paymentIntent.getMetadata() != null ? paymentIntent.getMetadata() : Collections.emptyMap();
        String localPaymentId = metadata.get("localPaymentId");
        String reference = metadata.get("reference");

        return paymentRepository.findByExternalId(paymentIntent.getId())
                .or(() -> StringUtils.hasText(localPaymentId) ? paymentRepository.findById(localPaymentId) : java.util.Optional.empty())
                .or(() -> StringUtils.hasText(reference) ? paymentRepository.findByExternalReference(reference) : java.util.Optional.empty())
                .orElseGet(() -> buildRecoveredPayment(paymentIntent, metadata));
    }

    private Payment buildRecoveredPayment(PaymentIntent paymentIntent, Map<String, String> metadata) {
        String localPaymentId = metadata.get("localPaymentId");

        return Payment.builder()
                .id(StringUtils.hasText(localPaymentId) ? localPaymentId : UUID.randomUUID().toString())
                .user(getUserById(metadata.get("userId")))
                .plan(getPlanById(metadata.get("planId")))
                .amount(resolveAmount(paymentIntent.getAmount(), null))
                .currency(normalizeCurrency(paymentIntent.getCurrency()))
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PENDING)
                .provider(STRIPE_PROVIDER)
                .providerMethod(resolvePaymentMethodType(paymentIntent, CARD_PROVIDER_METHOD))
                .externalId(paymentIntent.getId())
                .externalReference(StringUtils.hasText(metadata.get("reference"))
                        ? metadata.get("reference")
                        : "stripe-webhook-" + paymentIntent.getId())
                .idempotencyKey("stripe-webhook-recovered-" + paymentIntent.getId())
                .build();
    }

    private String resolvePaymentMethodType(PaymentIntent paymentIntent, String fallback) {
        if (paymentIntent.getPaymentMethodTypes() != null && !paymentIntent.getPaymentMethodTypes().isEmpty()) {
            return paymentIntent.getPaymentMethodTypes().getFirst();
        }

        return StringUtils.hasText(fallback) ? fallback : CARD_PROVIDER_METHOD;
    }

    private Double resolveAmount(Long amountInMinorUnits, Double fallbackAmount) {
        if (amountInMinorUnits == null) {
            return fallbackAmount;
        }

        return BigDecimal.valueOf(amountInMinorUnits)
                .movePointLeft(2)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String normalizeCurrency(String currency) {
        return StringUtils.hasText(currency) ? currency.toUpperCase(Locale.ROOT) : "PEN";
    }

    private long toMinorUnits(Double amount) {
        return BigDecimal.valueOf(amount)
                .movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private PaymentStatus resolvePaymentStatus(String externalStatus, String externalStatusDetail) {
        if (!StringUtils.hasText(externalStatus)) {
            return PaymentStatus.PENDING;
        }

        return switch (externalStatus) {
            case "succeeded" -> PaymentStatus.SUCCESS;
            case "canceled" -> PaymentStatus.FAILED;
            case "requires_payment_method" -> StringUtils.hasText(externalStatusDetail)
                    ? PaymentStatus.FAILED
                    : PaymentStatus.PENDING;
            default -> PaymentStatus.PENDING;
        };
    }
}
