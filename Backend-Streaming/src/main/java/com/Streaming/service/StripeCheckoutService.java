package com.Streaming.service;

import com.Streaming.dto.response.StripeCheckoutConfigResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class StripeCheckoutService {

    private static final String STRIPE_PROVIDER = "STRIPE";

    @Value("${app.stripe.publishable-key:}")
    private String stripePublishableKey;

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${app.billing.currency:PEN}")
    private String billingCurrency;

    public StripeCheckoutConfigResponse getCheckoutConfig() {
        boolean enabled = StringUtils.hasText(stripePublishableKey) && StringUtils.hasText(stripeSecretKey);

        return StripeCheckoutConfigResponse.builder()
                .provider(STRIPE_PROVIDER)
                .enabled(enabled)
                .publishableKey(enabled ? stripePublishableKey : null)
                .currency(billingCurrency)
                .build();
    }
}
