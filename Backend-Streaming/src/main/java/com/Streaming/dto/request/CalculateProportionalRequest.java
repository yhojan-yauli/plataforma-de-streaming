package com.Streaming.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CalculateProportionalRequest {

    @NotBlank(message = "El plan es obligatorio")
    private String planId;

    @NotNull(message = "El monto disponible es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto disponible debe ser mayor a 0")
    private Double availableAmount;
}
