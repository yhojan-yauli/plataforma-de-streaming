package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminPaymentResponse {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String planId;
    private SubscriptionPlanResponse plan;
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
    private String subscriptionId;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    private Boolean subscriptionActive;
}
