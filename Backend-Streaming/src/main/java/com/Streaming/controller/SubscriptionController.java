package com.Streaming.controller;

import com.Streaming.dto.request.ActivateSubscriptionRequest;
import com.Streaming.dto.request.CalculateProportionalRequest;
import com.Streaming.dto.request.CreateStripePaymentIntentRequest;
import com.Streaming.dto.response.PaymentResponse;
import com.Streaming.dto.response.ProportionalAccessResponse;
import com.Streaming.dto.response.StripeCheckoutConfigResponse;
import com.Streaming.dto.response.StripePaymentIntentResponse;
import com.Streaming.dto.response.SubscriptionPlanResponse;
import com.Streaming.dto.response.SubscriptionResponse;
import com.Streaming.service.StripeCheckoutService;
import com.Streaming.service.StripePaymentService;
import com.Streaming.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final StripeCheckoutService stripeCheckoutService;
    private final StripePaymentService stripePaymentService;

    @GetMapping("/plans")
    public List<SubscriptionPlanResponse> getPlans() {
        return subscriptionService.getPlans();
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription(Authentication authentication) {
        return subscriptionService.findCurrentSubscription(authentication.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/calculate-proportional")
    public ProportionalAccessResponse calculateProportional(
            @Valid @RequestBody CalculateProportionalRequest request
    ) {
        return subscriptionService.calculateProportional(request);
    }

    @PostMapping("/activate")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public SubscriptionResponse activateSubscription(
            Authentication authentication,
            @Valid @RequestBody ActivateSubscriptionRequest request
    ) {
        return subscriptionService.activateSubscription(authentication.getName(), request);
    }

    @GetMapping("/stripe/config")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public StripeCheckoutConfigResponse getStripeConfig() {
        return stripeCheckoutService.getCheckoutConfig();
    }

    @PostMapping("/stripe/payment-intents")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public StripePaymentIntentResponse createStripePaymentIntent(
            Authentication authentication,
            @Valid @RequestBody CreateStripePaymentIntentRequest request
    ) {
        return stripePaymentService.createPaymentIntent(authentication.getName(), request);
    }

    @PostMapping("/stripe/payment-intents/{paymentId}/sync")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public PaymentResponse syncStripePaymentIntent(
            Authentication authentication,
            @PathVariable String paymentId
    ) {
        return stripePaymentService.syncPaymentIntent(authentication.getName(), paymentId);
    }
}
