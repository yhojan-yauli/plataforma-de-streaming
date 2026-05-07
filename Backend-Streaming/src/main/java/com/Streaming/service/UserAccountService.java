package com.Streaming.service;

import com.Streaming.dto.request.ChangePasswordRequest;
import com.Streaming.dto.request.UpdateProfileRequest;
import com.Streaming.dto.request.UpdateWatchHistoryRequest;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.dto.response.UserResponse;
import com.Streaming.dto.response.WatchHistoryResponse;
import com.Streaming.exception.BadRequestException;
import com.Streaming.exception.ResourceNotFoundException;
import com.Streaming.exception.UnauthorizedException;
import com.Streaming.entity.Content;
import com.Streaming.entity.Episode;
import com.Streaming.entity.User;
import com.Streaming.entity.UserMyList;
import com.Streaming.entity.WatchHistory;
import com.Streaming.repository.ContentRepository;
import com.Streaming.repository.EpisodeRepository;
import com.Streaming.repository.UserMyListRepository;
import com.Streaming.repository.UserRepository;
import com.Streaming.repository.WatchHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAccountService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;
    private final EpisodeRepository episodeRepository;
    private final UserMyListRepository userMyListRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final ContentService contentService;

    public UserResponse getProfile(String email) {
        return new UserResponse(getUserByEmail(email));
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        user.setName(request.getName().trim());
        user.setUpdatedAt(LocalDateTime.now());
        return new UserResponse(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("La contraseña actual es incorrecta");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("La nueva contraseña no puede ser igual a la actual");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public String requestVerification(String email) {
        User user = getUserByEmail(email);

        if (user.isEmailVerified()) {
            return "Tu correo ya está verificado";
        }

        user.setVerificationToken(UUID.randomUUID().toString());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return "Solicitud de verificación registrada";
    }

    public List<ContentResponse> getMyList(String email) {
        User user = getUserByEmail(email);
        return userMyListRepository.findByUserIdOrderByAddedAtDesc(user.getId())
                .stream()
                .map(UserMyList::getContent)
                .map(content -> contentService.toResponse(content, false))
                .toList();
    }

    public void addToMyList(String email, String contentId) {
        User user = getUserByEmail(email);
        Content content = getActiveContent(contentId);

        if (userMyListRepository.existsByUserIdAndContentId(user.getId(), contentId)) {
            return;
        }

        userMyListRepository.save(UserMyList.builder()
                .user(user)
                .content(content)
                .addedAt(LocalDateTime.now())
                .build());
    }

    public void removeFromMyList(String email, String contentId) {
        User user = getUserByEmail(email);
        userMyListRepository.findByUserIdAndContentId(user.getId(), contentId)
                .ifPresent(userMyListRepository::delete);
    }

    public List<WatchHistoryResponse> getHistory(String email) {
        User user = getUserByEmail(email);
        return watchHistoryRepository.findByUserIdOrderByLastWatchedDesc(user.getId())
                .stream()
                .map(this::toWatchHistoryResponse)
                .toList();
    }

    public WatchHistoryResponse updateHistory(String email, String contentId, UpdateWatchHistoryRequest request) {
        User user = getUserByEmail(email);
        Content content = getActiveContent(contentId);
        Episode episode = getEpisodeForContent(contentId, request.getEpisodeId());

        WatchHistory history = watchHistoryRepository.findEntry(user.getId(), contentId, request.getEpisodeId())
                .orElse(WatchHistory.builder()
                        .user(user)
                        .content(content)
                        .episode(episode)
                        .build());

        int previousProgress = history.getProgress() == null ? 0 : history.getProgress();

        history.setEpisode(episode);
        history.setProgress(request.getProgress());
        history.setLastWatched(LocalDateTime.now());

        WatchHistory savedHistory = watchHistoryRepository.save(history);

        if (previousProgress == 0 && request.getProgress() > 0) {
            content.setViews((content.getViews() == null ? 0 : content.getViews()) + 1);
            content.setUpdatedAt(LocalDateTime.now());
            contentRepository.save(content);
        }

        return toWatchHistoryResponse(savedHistory);
    }

    public List<WatchHistoryResponse> getContinueWatching(String email) {
        User user = getUserByEmail(email);
        return watchHistoryRepository.findByUserIdAndProgressGreaterThanAndProgressLessThanOrderByLastWatchedDesc(
                        user.getId(),
                        0,
                        95
                )
                .stream()
                .map(this::toWatchHistoryResponse)
                .toList();
    }

    private WatchHistoryResponse toWatchHistoryResponse(WatchHistory history) {
        return WatchHistoryResponse.builder()
                .id(history.getId())
                .contentId(history.getContent().getId())
                .episodeId(history.getEpisode() != null ? history.getEpisode().getId() : null)
                .content(contentService.toResponse(history.getContent(), false))
                .progress(history.getProgress())
                .lastWatched(history.getLastWatched())
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Content getActiveContent(String contentId) {
        return contentRepository.findByIdAndActiveTrue(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Contenido no encontrado"));
    }

    private Episode getEpisodeForContent(String contentId, String episodeId) {
        if (episodeId == null || episodeId.isBlank()) {
            return null;
        }

        return episodeRepository.findByIdAndContentId(episodeId, contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Episodio no encontrado"));
    }
}
