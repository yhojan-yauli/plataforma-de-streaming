package com.Streaming.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStripePaymentIntentRequest {

    @NotBlank(message = "El plan es obligatorio")
    private String planId;
}
