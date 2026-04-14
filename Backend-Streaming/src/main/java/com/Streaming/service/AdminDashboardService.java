package com.Streaming.service;

import com.Streaming.dto.response.AdminStatsResponse;
import com.Streaming.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;

    public AdminStatsResponse getStats() {

        LocalDate now = LocalDate.now();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long totalContent = contentRepository.count();
        long activeSubscriptions = subscriptionRepository.countByActiveTrue();

        double monthlyRevenue = paymentRepository.getMonthlyRevenue(
                now.getMonthValue(),
                now.getYear()
        );

        long todayViews = contentRepository.getTotalViews();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalContent(totalContent)
                .monthlyRevenue(monthlyRevenue)
                .activeSubscriptions(activeSubscriptions)
                .todayViews(todayViews)
                .build();
    }

    public List<Map<String, Object>> getRevenueByMonth(int year) {
        List<Object[]> results = paymentRepository.getRevenueRaw(year);

        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] r : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", r[0]);     // número del mes
            map.put("revenue", r[1]);   // total dinero
            response.add(map);
        }

        return response;
    }

    public List<Map<String, Object>> getViewsLastWeek() {
        List<Object[]> results = contentRepository.getViewsRaw();

        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] r : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("day", r[0].toString()); // fecha
            map.put("views", r[1]);          // vistas
            response.add(map);
        }

        return response;
    }
}