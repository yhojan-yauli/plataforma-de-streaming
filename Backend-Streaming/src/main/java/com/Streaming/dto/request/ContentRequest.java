package com.Streaming.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ContentRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 180, message = "El título no puede superar los 180 caracteres")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotBlank(message = "El tipo es obligatorio")
    private String type;

    @NotEmpty(message = "Debe existir al menos un género")
    private List<@NotBlank(message = "El género no puede estar vacío") String> genre;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 1888, message = "El año no es válido")
    @Max(value = 3000, message = "El año no es válido")
    private Integer year;

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración debe ser mayor a 0")
    private Integer duration;

    @NotBlank(message = "El poster es obligatorio")
    private String posterUrl;
    private String bannerUrl;

    @NotBlank(message = "La URL del video es obligatoria")
    private String videoUrl;
    private String trailerUrl;
}
