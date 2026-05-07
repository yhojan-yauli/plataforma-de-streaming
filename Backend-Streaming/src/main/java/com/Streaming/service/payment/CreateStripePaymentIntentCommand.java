package com.Streaming.service.payment;

import java.util.Map;

public record CreateStripePaymentIntentCommand(
        Long amount,
        String currency,
        String receiptEmail,
        String description,
        Map<String, String> metadata,
        String idempotencyKey
) {
}
