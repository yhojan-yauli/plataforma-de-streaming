package com.Streaming.controller;

import com.Streaming.dto.request.ContentRequest;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
public class AdminContentController {

    private final ContentService contentService;

    @GetMapping
    public Page<ContentResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return contentService.getAll(search, type, page, size);
    }

    @PostMapping
    public ContentResponse create(@RequestBody ContentRequest request) {
        return contentService.create(request);
    }

    @PutMapping("/{id}")
    public ContentResponse update(@PathVariable String id, @RequestBody ContentRequest request) {
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