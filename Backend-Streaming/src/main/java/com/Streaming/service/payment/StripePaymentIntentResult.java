package com.Streaming.service.payment;

public record StripePaymentIntentResult(
        String id,
        String clientSecret,
        String status,
        String paymentMethodType,
        String statusDetail
) {
}
