package com.Streaming.dto;

import com.Streaming.dto.request.ContentRequest;
import com.Streaming.dto.request.RegisterRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestValidationTests {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void registerRequestRequiresValidEmailNameAndPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("correo-invalido");
        request.setName(" ");
        request.setPassword("123");

        var violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    void contentRequestRequiresAtLeastOneGenre() {
        ContentRequest request = new ContentRequest();
        request.setTitle("Titulo");
        request.setDescription("Descripcion");
        request.setType("MOVIE");
        request.setGenre(List.of(" "));
        request.setYear(2024);
        request.setDuration(120);
        request.setPosterUrl("https://example.com/poster.jpg");
        request.setVideoUrl("https://example.com/video.mp4");

        var violations = validator.validate(request);

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("genre")));
    }
}
