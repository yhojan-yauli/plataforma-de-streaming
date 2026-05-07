package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StripeCheckoutConfigResponse {

    private String provider;
    private boolean enabled;
    private String publishableKey;
    private String currency;
}
