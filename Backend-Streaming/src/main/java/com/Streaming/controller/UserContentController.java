package com.Streaming.controller;

import com.Streaming.entity.Content;
import com.Streaming.repository.ContentRepository;
import com.Streaming.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/content")
@RequiredArgsConstructor
public class UserContentController {

    private final ContentRepository contentRepository;

    private final ContentService contentService;

    // 🔹 TODOS LOS CONTENIDOS ACTIVOS
    @GetMapping
    public List<Content> getAllActiveContent() {
        return contentRepository.findByActiveTrue();
    }

    @GetMapping("/featured")
    public Content getFeatured() {
        return contentService.getFeatured();
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return contentService.getCategories();
    }

    @GetMapping("/recommendations")
    public List<Content> getRecommendations() {
        return contentService.getRecommendations();
    }
}