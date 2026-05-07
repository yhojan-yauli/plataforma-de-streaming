package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubscriptionPlanResponse {

    private String id;
    private String type;
    private Integer months;
    private Double price;
    private String currency;
    private String description;
    private boolean active;
}
