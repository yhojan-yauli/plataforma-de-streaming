package com.Streaming.controller;

import com.Streaming.dto.response.AdminPaymentResponse;
import com.Streaming.dto.response.AdminStatsResponse;
import com.Streaming.service.AdminDashboardService;
import com.Streaming.shared.api.PageResponse;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminDashboardService.getStats();
    }

    @GetMapping("/reports/revenue")
    public List<Map<String, Object>> getRevenueByMonth(@RequestParam @Min(value = 2000, message = "El año no es válido") int year) {
        return adminDashboardService.getRevenueByMonth(year);
    }

    @GetMapping("/reports/views")
    public List<Map<String, Object>> getViewsByDay() {
        return adminDashboardService.getViewsLastWeek();
    }

    @GetMapping("/payments")
    public PageResponse<AdminPaymentResponse> getPayments(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return adminDashboardService.getPayments(pageable);
    }
}
