package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProportionalAccessResponse {

    private String planId;
    private Integer days;
    private Integer hours;
    private Double availableAmount;
    private Double referencePrice;
    private Double coveredPercentage;
}
