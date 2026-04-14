package com.Streaming.service;


import com.Streaming.dto.request.ContentRequest;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import com.Streaming.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;

    // 🔹 LISTAR + SEARCH + FILTER
    public Page<ContentResponse> getAll(String search, String type, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Content> contents;

        if (search != null && !search.isEmpty() && type != null && !type.isEmpty()) {
            contents = contentRepository.findByTitleContainingIgnoreCaseAndType(
                    search,
                    ContentType.valueOf(type.toUpperCase()),
                    pageable
            );
        } else if (search != null && !search.isEmpty()) {
            contents = contentRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (type != null && !type.isEmpty()) {
            contents = contentRepository.findByType(
                    ContentType.valueOf(type.toUpperCase()),
                    pageable
            );
        } else {
            contents = contentRepository.findAll(pageable);
        }

        return contents.map(this::toResponse);
    }

    // 🔹 CREATE
    public ContentResponse create(ContentRequest request) {

        Content content = Content.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(ContentType.valueOf(request.getType().toUpperCase()))
                .genre(request.getGenre())
                .year(request.getYear())
                .duration(request.getDuration())
                .posterUrl(request.getPosterUrl())
                .bannerUrl(request.getBannerUrl())
                .videoUrl(request.getVideoUrl())
                .trailerUrl(request.getTrailerUrl())
                .build();

        return toResponse(contentRepository.save(content));
    }

    // 🔹 UPDATE
    public ContentResponse update(String id, ContentRequest request) {

        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contenido no encontrado"));

        content.setTitle(request.getTitle());
        content.setDescription(request.getDescription());
        content.setType(ContentType.valueOf(request.getType().toUpperCase()));
        content.setGenre(request.getGenre());
        content.setYear(request.getYear());
        content.setDuration(request.getDuration());
        content.setPosterUrl(request.getPosterUrl());
        content.setBannerUrl(request.getBannerUrl());
        content.setVideoUrl(request.getVideoUrl());
        content.setTrailerUrl(request.getTrailerUrl());
        content.setUpdatedAt(java.time.LocalDateTime.now());

        return toResponse(contentRepository.save(content));
    }

    // 🔹 TOGGLE
    public void toggle(String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contenido no encontrado"));

        content.setActive(!content.isActive());

        contentRepository.save(content);
    }

    // 🔹 DELETE
    public void delete(String id) {
        contentRepository.deleteById(id);
    }

    // 🔹 MAPPER
    private ContentResponse toResponse(Content c) {
        return ContentResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .type(c.getType().name())
                .genre(c.getGenre())
                .year(c.getYear())
                .duration(c.getDuration())
                .rating(c.getRating())
                .views(c.getViews())
                .active(c.isActive())
                .posterUrl(c.getPosterUrl())
                .bannerUrl(c.getBannerUrl())
                .videoUrl(c.getVideoUrl())
                .trailerUrl(c.getTrailerUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }

//==============================================================================================================

    // 🔹 FEATURED (el más visto)
    public Content getFeatured() {
        return contentRepository.findTopByActiveTrueOrderByViewsDesc()
                .orElseThrow(() -> new RuntimeException("No hay contenido"));
    }

    // 🔹 CATEGORÍAS (simples por género)
    public List<Map<String, Object>> getCategories() {
        List<Content> all = contentRepository.findByActiveTrue();

        Map<String, List<Content>> grouped = new HashMap<>();

        for (Content c : all) {
            try {
                List<String> genres = Arrays.asList(
                        c.getGenre()
                                .replace("[", "")
                                .replace("]", "")
                                .replace("\"", "")
                                .split(",")
                );

                for (String g : genres) {
                    grouped.computeIfAbsent(g.trim(), k -> new ArrayList<>()).add(c);
                }

            } catch (Exception ignored) {}
        }

        List<Map<String, Object>> result = new ArrayList<>();

        int i = 1;
        for (Map.Entry<String, List<Content>> entry : grouped.entrySet()) {
            Map<String, Object> category = new HashMap<>();
            category.put("id", String.valueOf(i++));
            category.put("name", entry.getKey());
            category.put("contents", entry.getValue());
            result.add(category);
        }

        return result;
    }

    // 🔹 RECOMENDACIONES (top vistos)
    public List<Content> getRecommendations() {
        return contentRepository.findTop10ByActiveTrueOrderByViewsDesc();
    }
}