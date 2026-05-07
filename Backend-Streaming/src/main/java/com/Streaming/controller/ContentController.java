package com.Streaming.controller;

import com.Streaming.dto.request.CommentRequest;
import com.Streaming.dto.request.RatingRequest;
import com.Streaming.dto.response.CommentResponse;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.dto.response.EpisodeResponse;
import com.Streaming.service.ContentService;
import com.Streaming.service.SubscriptionService;
import com.Streaming.shared.api.ApiMessageResponse;
import com.Streaming.shared.api.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final SubscriptionService subscriptionService;

    @GetMapping("/browse")
    public PageResponse<ContentResponse> browse(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return contentService.browseActive(search, type, genre, year, page, size, false);
    }

    @GetMapping("/search")
    public List<ContentResponse> search(@RequestParam("q") String query) {
        return contentService.search(query, false);
    }

    @GetMapping("/{id}")
    public ContentResponse getById(@PathVariable String id, Authentication authentication) {
        return contentService.getById(id, canAccessPlayback(authentication));
    }

    @GetMapping("/{id}/episodes")
    public List<EpisodeResponse> getEpisodes(
            @PathVariable String id,
            @RequestParam(required = false) Integer season,
            Authentication authentication
    ) {
        return contentService.getEpisodes(id, season, canAccessPlayback(authentication));
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> getComments(@PathVariable String id) {
        return contentService.getComments(id);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public CommentResponse addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        return contentService.addComment(id, authentication.getName(), request);
    }

    @PostMapping("/{id}/rate")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ApiMessageResponse rate(
            @PathVariable String id,
            @Valid @RequestBody RatingRequest request,
            Authentication authentication
    ) {
        contentService.rate(id, authentication.getName(), request);
        return new ApiMessageResponse("Valoración registrada");
    }

    private boolean canAccessPlayback(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        return subscriptionService.authenticationCanAccessPlayback(authentication.getName(), isAdmin);
    }
}
