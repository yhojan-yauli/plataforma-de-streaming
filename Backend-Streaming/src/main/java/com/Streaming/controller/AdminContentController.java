package com.Streaming.controller;

import com.Streaming.dto.request.ContentRequest;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.service.ContentService;
import com.Streaming.shared.api.PageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final ContentService contentService;

    @GetMapping
    public PageResponse<ContentResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "La página no puede ser negativa") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "El tamaño debe ser mayor a 0") @Max(value = 100, message = "El tamaño máximo es 100") int size
    ) {
        return PageResponse.from(contentService.getAll(search, type, page, size));
    }

    @PostMapping
    public ContentResponse create(@Valid @RequestBody ContentRequest request) {
        return contentService.create(request);
    }

    @PutMapping("/{id}")
    public ContentResponse update(@PathVariable String id, @Valid @RequestBody ContentRequest request) {
        return contentService.update(id, request);
    }

    @PutMapping("/{id}/status")
    public void toggle(@PathVariable String id) {
        contentService.toggle(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        contentService.delete(id);
    }
}
