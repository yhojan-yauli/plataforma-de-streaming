package com.Streaming.service;

import com.Streaming.dto.request.ActivateSubscriptionRequest;
import com.Streaming.dto.request.CalculateProportionalRequest;
import com.Streaming.dto.response.ProportionalAccessResponse;
import com.Streaming.dto.response.SubscriptionPlanResponse;
import com.Streaming.dto.response.SubscriptionResponse;
import com.Streaming.entity.PaymentMethod;
import com.Streaming.entity.Subscription;
import com.Streaming.entity.SubscriptionPlan;
import com.Streaming.entity.User;
import com.Streaming.exception.ResourceNotFoundException;
import com.Streaming.repository.SubscriptionPlanRepository;
import com.Streaming.repository.SubscriptionRepository;
import com.Streaming.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {

    private static final String PLAN_ONE_MONTH = "1_MONTH";
    private static final String PLAN_THREE_MONTHS = "3_MONTHS";
    private static final String PLAN_TWELVE_MONTHS = "12_MONTHS";

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionPlanResponse> getPlans() {
        ensureDefaultPlans();

        return subscriptionPlanRepository.findByActiveTrueOrderByMonthsAsc()
                .stream()
                .map(this::toPlanResponse)
                .toList();
    }

    @Transactional(dontRollbackOn = ResourceNotFoundException.class)
    public SubscriptionResponse getCurrentSubscription(String email) {
        User user = getUserByEmail(email);
        expireSubscriptionIfNeeded(user);

        Subscription subscription = subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("El usuario no tiene una suscripción activa"));

        return toSubscriptionResponse(subscription);
    }

    public Optional<SubscriptionResponse> findCurrentSubscription(String email) {
        User user = getUserByEmail(email);
        expireSubscriptionIfNeeded(user);

        return subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId())
                .map(this::toSubscriptionResponse);
    }

    public ProportionalAccessResponse calculateProportional(CalculateProportionalRequest request) {
        ensureDefaultPlans();

        SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndActiveTrue(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan no encontrado"));

        double coveredPercentage = Math.min(100.0, (request.getAvailableAmount() / plan.getPrice()) * 100.0);
        double proportionalHours = Math.max(0.0, (coveredPercentage / 100.0) * (plan.getMonths() * 30 * 24.0));

        int totalHours = (int) Math.floor(proportionalHours);
        int days = totalHours / 24;
        int hours = totalHours % 24;

        return ProportionalAccessResponse.builder()
                .planId(plan.getId())
                .days(days)
                .hours(hours)
                .availableAmount(request.getAvailableAmount())
                .referencePrice(plan.getPrice())
                .coveredPercentage(Math.round(coveredPercentage * 100.0) / 100.0)
                .build();
    }

    public SubscriptionResponse activateSubscription(String email, ActivateSubscriptionRequest request) {
        ensureDefaultPlans();

        User user = getUserByEmail(email);
        SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndActiveTrue(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan no encontrado"));

        return toSubscriptionResponse(activatePaidSubscription(user, plan, request.getPaymentMethod(), plan.getPrice()));
    }

    public Subscription activatePaidSubscription(User user, SubscriptionPlan plan, PaymentMethod paymentMethod, Double amountPaid) {
        Subscription subscription = subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId())
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();

        if (subscription != null && subscription.getEndDate() != null && subscription.getEndDate().isBefore(now)) {
            subscription.setActive(false);
            subscriptionRepository.save(subscription);
            subscription = null;
        }

        if (subscription == null) {
            Subscription newSubscription = Subscription.builder()
                    .user(user)
                    .plan(plan)
                    .startDate(now)
                    .endDate(now.plusDays(plan.getMonths() * 30L))
                    .active(true)
                    .paymentMethod(paymentMethod)
                    .amountPaid(amountPaid)
                    .build();

            return subscriptionRepository.save(newSubscription);
        }

        LocalDateTime effectiveStart = subscription.getEndDate() != null && subscription.getEndDate().isAfter(now)
                ? subscription.getEndDate()
                : now;

        if (subscription.getStartDate() == null) {
            subscription.setStartDate(now);
        }

        subscription.setPlan(plan);
        subscription.setEndDate(effectiveStart.plusDays(plan.getMonths() * 30L));
        subscription.setActive(true);
        subscription.setPaymentMethod(paymentMethod);
        subscription.setAmountPaid((subscription.getAmountPaid() == null ? 0.0 : subscription.getAmountPaid()) + amountPaid);

        return subscriptionRepository.save(subscription);
    }

    public boolean userCanAccessPlayback(String email) {
        User user = getUserByEmail(email);
        expireSubscriptionIfNeeded(user);
        return subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId()).isPresent();
    }

    public boolean authenticationCanAccessPlayback(String email, boolean isAdmin) {
        return isAdmin || userCanAccessPlayback(email);
    }

    public SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .type(plan.getType())
                .months(plan.getMonths())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .description(plan.getDescription())
                .active(plan.isActive())
                .build();
    }

    public SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        Duration remaining = Duration.between(LocalDateTime.now(), subscription.getEndDate());
        long totalHours = Math.max(0L, remaining.toHours());

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .planId(subscription.getPlan().getId())
                .plan(toPlanResponse(subscription.getPlan()))
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .active(subscription.isActive())
                .paymentMethod(subscription.getPaymentMethod() != null ? subscription.getPaymentMethod().name() : null)
                .amountPaid(subscription.getAmountPaid())
                .daysRemaining(totalHours / 24)
                .hoursRemaining(totalHours % 24)
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void expireSubscriptionIfNeeded(User user) {
        subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(user.getId())
                .filter(subscription -> subscription.getEndDate() != null && subscription.getEndDate().isBefore(LocalDateTime.now()))
                .ifPresent(subscription -> {
                    subscription.setActive(false);
                    subscriptionRepository.save(subscription);
                });
    }

    private void ensureDefaultPlans() {
        ensurePlan(PLAN_ONE_MONTH, 1, 20.0, "Acceso completo por 1 mes");
        ensurePlan(PLAN_THREE_MONTHS, 3, 50.0, "Acceso completo por 3 meses");
        ensurePlan(PLAN_TWELVE_MONTHS, 12, 160.0, "Acceso completo por 12 meses");
    }

    private void ensurePlan(String type, int months, double price, String description) {
        SubscriptionPlan plan = subscriptionPlanRepository.findByTypeAndActiveTrue(type)
                .orElse(SubscriptionPlan.builder()
                        .type(type)
                        .build());

        plan.setMonths(months);
        plan.setPrice(price);
        plan.setCurrency("PEN");
        plan.setDescription(description);
        plan.setActive(true);

        subscriptionPlanRepository.save(plan);
    }
}
