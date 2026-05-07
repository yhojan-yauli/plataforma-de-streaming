package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {

    private String id;
    private Double amount;
    private String currency;
    private String method;
    private String status;
    private String provider;
    private String providerMethod;
    private String externalId;
    private String externalStatus;
    private String externalStatusDetail;
    private LocalDateTime createdAt;
    private SubscriptionResponse subscription;
}
