package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StripePaymentIntentResponse {

    private String paymentId;
    private String clientSecret;
    private String externalId;
    private String externalStatus;
    private Double amount;
    private String currency;
    private SubscriptionPlanResponse plan;
}
