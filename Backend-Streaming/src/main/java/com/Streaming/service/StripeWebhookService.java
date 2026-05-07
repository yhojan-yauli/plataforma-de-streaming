package com.Streaming.service;

import com.Streaming.entity.Payment;
import com.Streaming.entity.StripeWebhookEvent;
import com.Streaming.entity.StripeWebhookEventStatus;
import com.Streaming.exception.BadRequestException;
import com.Streaming.repository.StripeWebhookEventRepository;
import com.Streaming.shared.api.ApiMessageResponse;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class StripeWebhookService {

    private final StripeWebhookEventRepository stripeWebhookEventRepository;
    private final StripePaymentService stripePaymentService;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    public ApiMessageResponse handleWebhook(String payload, String signature) {
        if (!StringUtils.hasText(stripeWebhookSecret)) {
            throw new BadRequestException("Stripe webhook no está configurado en el backend");
        }

        if (!StringUtils.hasText(signature)) {
            throw new BadRequestException("Falta la firma del webhook de Stripe");
        }

        Event event = constructVerifiedEvent(payload, signature);
        StripeWebhookEvent webhookEvent = stripeWebhookEventRepository.findById(event.getId())
                .orElseGet(() -> StripeWebhookEvent.builder().id(event.getId()).build());

        if (webhookEvent.getStatus() == StripeWebhookEventStatus.PROCESSED
                || webhookEvent.getStatus() == StripeWebhookEventStatus.IGNORED) {
            return new ApiMessageResponse("Evento Stripe ya procesado");
        }

        webhookEvent.setType(event.getType());
        webhookEvent.setPayload(payload);
        webhookEvent.setEventCreatedAt(toDateTime(event.getCreated()));
        webhookEvent.setAttemptCount((webhookEvent.getAttemptCount() == null ? 0 : webhookEvent.getAttemptCount()) + 1);
        webhookEvent.setStatus(StripeWebhookEventStatus.PROCESSING);
        webhookEvent.setLastError(null);
        stripeWebhookEventRepository.save(webhookEvent);

        try {
            Payment payment = transactionTemplate.execute(status -> reconcileEvent(event));

            webhookEvent.setPaymentId(payment != null ? payment.getId() : webhookEvent.getPaymentId());
            webhookEvent.setPaymentExternalId(payment != null ? payment.getExternalId() : webhookEvent.getPaymentExternalId());
            webhookEvent.setStatus(payment != null ? StripeWebhookEventStatus.PROCESSED : StripeWebhookEventStatus.IGNORED);
            webhookEvent.setProcessedAt(LocalDateTime.now());
            stripeWebhookEventRepository.save(webhookEvent);

            return new ApiMessageResponse(payment != null ? "Evento Stripe procesado" : "Evento Stripe ignorado");
        } catch (RuntimeException exception) {
            webhookEvent.setStatus(StripeWebhookEventStatus.FAILED);
            webhookEvent.setLastError(exception.getMessage());
            stripeWebhookEventRepository.save(webhookEvent);
            throw exception;
        }
    }

    private Event constructVerifiedEvent(String payload, String signature) {
        try {
            return Webhook.constructEvent(payload, signature, stripeWebhookSecret);
        } catch (SignatureVerificationException exception) {
            throw new BadRequestException("La firma del webhook de Stripe no es válida");
        }
    }

    private Payment reconcileEvent(Event event) {
        return switch (event.getType()) {
            case "payment_intent.created",
                 "payment_intent.processing",
                 "payment_intent.succeeded",
                 "payment_intent.payment_failed",
                 "payment_intent.canceled" -> stripePaymentService.reconcileWebhookPaymentIntent(extractPaymentIntent(event));
            default -> null;
        };
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        Object dataObject = event.getDataObjectDeserializer().getObject().orElse(null);

        if (dataObject == null) {
            try {
                dataObject = event.getDataObjectDeserializer().deserializeUnsafe();
            } catch (EventDataObjectDeserializationException exception) {
                throw new BadRequestException("No se pudo deserializar el objeto del webhook de Stripe");
            }
        }

        if (dataObject instanceof PaymentIntent paymentIntent) {
            return paymentIntent;
        }

        throw new BadRequestException("El webhook de Stripe no contiene un PaymentIntent válido");
    }

    private LocalDateTime toDateTime(Long epochSeconds) {
        if (epochSeconds == null) {
            return null;
        }

        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }
}
