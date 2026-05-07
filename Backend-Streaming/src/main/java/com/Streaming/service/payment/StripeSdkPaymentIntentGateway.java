package com.Streaming.service.payment;

import com.Streaming.exception.BadRequestException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Service
public class StripeSdkPaymentIntentGateway implements StripePaymentIntentGateway {

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    @Override
    public StripePaymentIntentResult createPaymentIntent(CreateStripePaymentIntentCommand command) {
        ensureStripeConfigured();

        try {
            Stripe.apiKey = stripeSecretKey;

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(command.amount())
                    .setCurrency(command.currency().toLowerCase(Locale.ROOT))
                    .setReceiptEmail(command.receiptEmail())
                    .setDescription(command.description())
                    .addPaymentMethodType("card");

            command.metadata().forEach(paramsBuilder::putMetadata);

            PaymentIntent paymentIntent = PaymentIntent.create(
                    paramsBuilder.build(),
                    RequestOptions.builder()
                            .setIdempotencyKey(command.idempotencyKey())
                            .build()
            );

            return toResult(paymentIntent);
        } catch (StripeException exception) {
            throw new BadRequestException("No se pudo crear la intención de pago en Stripe");
        }
    }

    @Override
    public StripePaymentIntentResult getPaymentIntent(String externalId) {
        ensureStripeConfigured();

        try {
            Stripe.apiKey = stripeSecretKey;
            return toResult(PaymentIntent.retrieve(externalId));
        } catch (StripeException exception) {
            throw new BadRequestException("No se pudo consultar el estado del pago en Stripe");
        }
    }

    private void ensureStripeConfigured() {
        if (!StringUtils.hasText(stripeSecretKey)) {
            throw new BadRequestException("Stripe no está configurado en el backend");
        }
    }

    private StripePaymentIntentResult toResult(PaymentIntent paymentIntent) {
        String paymentMethodType = paymentIntent.getPaymentMethodTypes() != null && !paymentIntent.getPaymentMethodTypes().isEmpty()
                ? paymentIntent.getPaymentMethodTypes().getFirst()
                : "card";

        String statusDetail = paymentIntent.getLastPaymentError() != null
                ? paymentIntent.getLastPaymentError().getMessage()
                : null;

        return new StripePaymentIntentResult(
                paymentIntent.getId(),
                paymentIntent.getClientSecret(),
                paymentIntent.getStatus(),
                paymentMethodType,
                statusDetail
        );
    }
}
