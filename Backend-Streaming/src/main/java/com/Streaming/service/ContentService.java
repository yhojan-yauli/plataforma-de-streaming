package com.Streaming.service;


import com.Streaming.dto.request.CommentRequest;
import com.Streaming.dto.request.ContentRequest;
import com.Streaming.dto.request.RatingRequest;
import com.Streaming.dto.response.CategoryResponse;
import com.Streaming.dto.response.CommentResponse;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.dto.response.EpisodeResponse;
import com.Streaming.exception.BadRequestException;
import com.Streaming.exception.ResourceNotFoundException;
import com.Streaming.entity.Comment;
import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import com.Streaming.entity.Episode;
import com.Streaming.entity.Rating;
import com.Streaming.entity.User;
import com.Streaming.repository.CommentRepository;
import com.Streaming.repository.ContentRepository;
import com.Streaming.repository.EpisodeRepository;
import com.Streaming.repository.RatingRepository;
import com.Streaming.repository.UserRepository;
import com.Streaming.shared.api.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final CommentRepository commentRepository;
    private final EpisodeRepository episodeRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

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
                    parseContentType(type),
                    pageable
            );
        } else {
            contents = contentRepository.findAll(pageable);
        }

        return contents.map(this::toResponse);
    }

    public PageResponse<ContentResponse> browseActive(
            String search,
            String type,
            String genre,
            Integer year,
            int page,
            int size,
            boolean includePlaybackUrls
    ) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Order.desc("views"), Sort.Order.desc("createdAt"))
        );

        ContentType contentType = hasText(type) ? parseContentType(type) : null;
        String normalizedSearch = normalizeFilter(search);
        String normalizedGenre = hasText(genre) ? "\"" + genre.trim() + "\"" : null;

        Page<ContentResponse> contents = contentRepository.browseActive(
                        normalizedSearch,
                        contentType,
                        year,
                        normalizedGenre,
                        pageable
                )
                .map(content -> toResponse(content, includePlaybackUrls));

        return PageResponse.from(contents);
    }

    public ContentResponse create(ContentRequest request) {

        Content content = Content.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(parseContentType(request.getType()))
                .genre(serializeGenres(request.getGenre()))
                .year(request.getYear())
                .duration(request.getDuration())
                .posterUrl(request.getPosterUrl())
                .bannerUrl(request.getBannerUrl())
                .videoUrl(request.getVideoUrl())
                .trailerUrl(request.getTrailerUrl())
                .build();

        return toResponse(contentRepository.save(content));
    }

    public ContentResponse update(String id, ContentRequest request) {

        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenido no encontrado"));

        content.setTitle(request.getTitle());
        content.setDescription(request.getDescription());
        content.setType(parseContentType(request.getType()));
        content.setGenre(serializeGenres(request.getGenre()));
        content.setYear(request.getYear());
        content.setDuration(request.getDuration());
        content.setPosterUrl(request.getPosterUrl());
        content.setBannerUrl(request.getBannerUrl());
        content.setVideoUrl(request.getVideoUrl());
        content.setTrailerUrl(request.getTrailerUrl());
        content.setUpdatedAt(java.time.LocalDateTime.now());

        return toResponse(contentRepository.save(content));
    }

    public ContentResponse getById(String id, boolean includePlaybackUrls) {
        return toResponse(getActiveContent(id), includePlaybackUrls);
    }

    public List<ContentResponse> search(String query, boolean includePlaybackUrls) {
        String normalizedQuery = normalizeFilter(query);
        if (normalizedQuery == null) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.desc("views"), Sort.Order.desc("createdAt")));
        return contentRepository.browseActive(normalizedQuery, null, null, null, pageable)
                .map(content -> toResponse(content, includePlaybackUrls))
                .getContent();
    }

    public List<EpisodeResponse> getEpisodes(String contentId, Integer season, boolean includePlaybackUrls) {
        Content content = getActiveContent(contentId);

        if (content.getType() != ContentType.SERIES) {
            return List.of();
        }

        List<Episode> episodes = season == null
                ? episodeRepository.findByContentIdOrderBySeasonAscEpisodeAsc(contentId)
                : episodeRepository.findByContentIdAndSeasonOrderByEpisodeAsc(contentId, season);

        return episodes.stream()
                .map(episode -> toEpisodeResponse(episode, includePlaybackUrls))
                .toList();
    }

    public List<CommentResponse> getComments(String contentId) {
        getActiveContent(contentId);
        return commentRepository.findByContentIdOrderByPositiveDescCreatedAtDesc(contentId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    public CommentResponse addComment(String contentId, String userEmail, CommentRequest request) {
        User user = getUserByEmail(userEmail);
        Content content = getActiveContent(contentId);

        upsertRating(user, content, request.getRating());

        Comment comment = Comment.builder()
                .user(user)
                .content(content)
                .text(request.getText().trim())
                .rating(request.getRating())
                .positive(request.getRating() >= 4)
                .createdAt(LocalDateTime.now())
                .build();

        return toCommentResponse(commentRepository.save(comment));
    }

    public void rate(String contentId, String userEmail, RatingRequest request) {
        User user = getUserByEmail(userEmail);
        Content content = getActiveContent(contentId);
        upsertRating(user, content, request.getRating());
    }

    public void toggle(String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenido no encontrado"));

        content.setActive(!content.isActive());

        contentRepository.save(content);
    }

    public void delete(String id) {
        if (!contentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contenido no encontrado");
        }
        contentRepository.deleteById(id);
    }

    public List<ContentResponse> getAllActive(boolean includePlaybackUrls) {
        return contentRepository.findByActiveTrue()
                .stream()
                .map(content -> toResponse(content, includePlaybackUrls))
                .toList();
    }

    public ContentResponse getFeatured(boolean includePlaybackUrls) {
        Content featured = contentRepository.findTopByActiveTrueOrderByViewsDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No hay contenido disponible"));

        return toResponse(featured, includePlaybackUrls);
    }

    public List<CategoryResponse> getCategories(boolean includePlaybackUrls) {
        List<Content> all = contentRepository.findByActiveTrue();

        Map<String, List<ContentResponse>> grouped = new LinkedHashMap<>();

        for (Content content : all) {
            ContentResponse response = toResponse(content, includePlaybackUrls);
            for (String genre : response.getGenre()) {
                grouped.computeIfAbsent(genre, ignored -> new ArrayList<>()).add(response);
            }
        }

        List<CategoryResponse> result = new ArrayList<>();

        int i = 1;
        for (Map.Entry<String, List<ContentResponse>> entry : grouped.entrySet()) {
            result.add(CategoryResponse.builder()
                    .id(String.valueOf(i++))
                    .name(entry.getKey())
                    .contents(entry.getValue())
                    .build());
        }

        return result;
    }

    public List<ContentResponse> getRecommendations(boolean includePlaybackUrls) {
        return contentRepository.findTop10ByActiveTrueOrderByViewsDesc()
                .stream()
                .map(content -> toResponse(content, includePlaybackUrls))
                .toList();
    }

    public ContentResponse toResponse(Content c) {
        return toResponse(c, true);
    }

    public ContentResponse toResponse(Content c, boolean includePlaybackUrls) {
        return ContentResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .type(c.getType().name())
                .genre(parseGenres(c.getGenre()))
                .year(c.getYear())
                .duration(c.getDuration())
                .rating(c.getRating())
                .views(c.getViews())
                .active(c.isActive())
                .posterUrl(c.getPosterUrl())
                .bannerUrl(c.getBannerUrl())
                .videoUrl(includePlaybackUrls ? c.getVideoUrl() : null)
                .trailerUrl(c.getTrailerUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private EpisodeResponse toEpisodeResponse(Episode episode, boolean includePlaybackUrls) {
        return EpisodeResponse.builder()
                .id(episode.getId())
                .seriesId(episode.getContent().getId())
                .season(episode.getSeason())
                .episode(episode.getEpisode())
                .title(episode.getTitle())
                .description(episode.getDescription())
                .duration(episode.getDuration())
                .videoUrl(includePlaybackUrls ? episode.getVideoUrl() : null)
                .thumbnailUrl(episode.getThumbnailUrl())
                .createdAt(episode.getCreatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .userAvatar(comment.getUser().getAvatarUrl())
                .contentId(comment.getContent().getId())
                .text(comment.getText())
                .rating(comment.getRating())
                .positive(comment.isPositive())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private ContentType parseContentType(String type) {
        try {
            return ContentType.valueOf(type.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("El tipo de contenido no es válido");
        }
    }

    private String serializeGenres(List<String> genres) {
        List<String> sanitizedGenres = sanitizeGenres(genres);
        return sanitizedGenres.stream()
                .map(this::quoteGenre)
                .reduce("[", (acc, genre) -> acc.equals("[") ? acc + genre : acc + "," + genre) + "]";
    }

    private List<String> parseGenres(String rawGenres) {
        if (rawGenres == null || rawGenres.isBlank()) {
            return List.of();
        }

        String normalized = rawGenres.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        if (normalized.isBlank()) {
            return List.of();
        }

        return sanitizeGenres(Arrays.stream(normalized.split(","))
                .map(this::unquoteGenre)
                .toList());
    }

    private List<String> sanitizeGenres(List<String> genres) {
        if (genres == null) {
            return List.of();
        }

        List<String> sanitized = genres.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(genre -> !genre.isBlank())
                .distinct()
                .toList();

        if (sanitized.isEmpty()) {
            throw new BadRequestException("Debe existir al menos un género válido");
        }

        return sanitized;
    }

    private String quoteGenre(String genre) {
        return "\"" + genre
                .replace("\\", "\\\\")
                .replace("\"", "\\\"") + "\"";
    }

    private String unquoteGenre(String genre) {
        String normalized = genre.trim();
        if (normalized.startsWith("\"") && normalized.endsWith("\"") && normalized.length() >= 2) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        return normalized
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }

    private Content getActiveContent(String id) {
        return contentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenido no encontrado"));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void upsertRating(User user, Content content, Integer ratingValue) {
        Rating rating = ratingRepository.findByUserIdAndContentId(user.getId(), content.getId())
                .orElse(Rating.builder()
                        .user(user)
                        .content(content)
                        .build());

        rating.setRating(ratingValue);
        ratingRepository.save(rating);

        Double averageRating = ratingRepository.getAverageRatingByContentId(content.getId());
        content.setRating(averageRating == null ? 0.0 : averageRating);
        content.setUpdatedAt(LocalDateTime.now());
        contentRepository.save(content);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String normalizeFilter(String value) {
        return hasText(value) ? value.trim() : null;
    }
}
