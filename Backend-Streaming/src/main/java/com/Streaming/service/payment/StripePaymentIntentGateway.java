package com.Streaming.service.payment;

public interface StripePaymentIntentGateway {

    StripePaymentIntentResult createPaymentIntent(CreateStripePaymentIntentCommand command);

    StripePaymentIntentResult getPaymentIntent(String externalId);
}
