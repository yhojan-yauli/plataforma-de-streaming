package com.Streaming.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateWatchHistoryRequest {

    @NotNull(message = "El progreso es obligatorio")
    @Min(value = 0, message = "El progreso no puede ser menor a 0")
    @Max(value = 100, message = "El progreso no puede ser mayor a 100")
    private Integer progress;

    private String episodeId;
}
