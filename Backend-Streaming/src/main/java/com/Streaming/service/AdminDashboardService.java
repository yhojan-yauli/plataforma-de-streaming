package com.Streaming.service;

import com.Streaming.dto.response.AdminPaymentResponse;
import com.Streaming.dto.response.AdminStatsResponse;
import com.Streaming.entity.Payment;
import com.Streaming.repository.*;
import com.Streaming.shared.api.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final SubscriptionService subscriptionService;

    public AdminStatsResponse getStats() {

        LocalDate now = LocalDate.now();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long totalContent = contentRepository.count();
        long activeSubscriptions = subscriptionRepository.countByActiveTrueAndEndDateAfter(LocalDateTime.now());

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

    public PageResponse<AdminPaymentResponse> getPayments(Pageable pageable) {
        return PageResponse.from(paymentRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toAdminPaymentResponse));
    }

    private AdminPaymentResponse toAdminPaymentResponse(Payment payment) {
        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUser() != null ? payment.getUser().getId() : null)
                .userName(payment.getUser() != null ? payment.getUser().getName() : null)
                .userEmail(payment.getUser() != null ? payment.getUser().getEmail() : null)
                .planId(payment.getPlan() != null ? payment.getPlan().getId() : null)
                .plan(payment.getPlan() != null ? subscriptionService.toPlanResponse(payment.getPlan()) : null)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod() != null ? payment.getMethod().name() : null)
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .provider(payment.getProvider())
                .providerMethod(payment.getProviderMethod())
                .externalId(payment.getExternalId())
                .externalStatus(payment.getExternalStatus())
                .externalStatusDetail(payment.getExternalStatusDetail())
                .createdAt(payment.getCreatedAt())
                .subscriptionId(payment.getSubscription() != null ? payment.getSubscription().getId() : null)
                .subscriptionStartDate(payment.getSubscription() != null ? payment.getSubscription().getStartDate() : null)
                .subscriptionEndDate(payment.getSubscription() != null ? payment.getSubscription().getEndDate() : null)
                .subscriptionActive(payment.getSubscription() != null ? payment.getSubscription().isActive() : null)
                .build();
    }
}
