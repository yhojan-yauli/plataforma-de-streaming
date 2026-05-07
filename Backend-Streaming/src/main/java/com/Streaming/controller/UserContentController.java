package com.Streaming.controller;

import com.Streaming.dto.response.CategoryResponse;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/content")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserContentController {

    private final ContentService contentService;

    @GetMapping
    public List<ContentResponse> getAllActiveContent() {
        return contentService.getAllActive(false);
    }

    @GetMapping("/featured")
    public ContentResponse getFeatured() {
        return contentService.getFeatured(false);
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return contentService.getCategories(false);
    }

    @GetMapping("/recommendations")
    public List<ContentResponse> getRecommendations() {
        return contentService.getRecommendations(false);
    }
}
