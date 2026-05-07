package com.Streaming.dto.request;

import com.Streaming.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActivateSubscriptionRequest {

    @NotBlank(message = "El plan es obligatorio")
    private String planId;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;
}
