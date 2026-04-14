package com.Streaming.controller;

import com.Streaming.dto.response.AdminStatsResponse;
import com.Streaming.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminDashboardService.getStats();
    }
    @GetMapping("/reports/revenue")
    public List<Map<String, Object>> getRevenueByMonth(@RequestParam int year) {
        return adminDashboardService.getRevenueByMonth(year);
    }

    @GetMapping("/reports/views")
    public List<Map<String, Object>> getViewsByDay() {
        return adminDashboardService.getViewsLastWeek();
    }
}