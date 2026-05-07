package com.Streaming.controller;

import com.Streaming.service.StripeWebhookService;
import com.Streaming.shared.api.ApiMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final StripeWebhookService stripeWebhookService;

    @PostMapping("/stripe")
    public ApiMessageResponse handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        return stripeWebhookService.handleWebhook(payload, signature);
    }
}
