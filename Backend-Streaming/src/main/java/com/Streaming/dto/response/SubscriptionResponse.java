package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponse {

    private String id;
    private String userId;
    private String planId;
    private SubscriptionPlanResponse plan;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private String paymentMethod;
    private Double amountPaid;
    private Long daysRemaining;
    private Long hoursRemaining;
}
