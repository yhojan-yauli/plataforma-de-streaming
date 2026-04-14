package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long totalContent;
    private double monthlyRevenue;
    private long activeSubscriptions;
    private long todayViews;
}