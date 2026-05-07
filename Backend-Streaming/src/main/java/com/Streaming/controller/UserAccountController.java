package com.Streaming.controller;

import com.Streaming.dto.request.ChangePasswordRequest;
import com.Streaming.dto.request.UpdateProfileRequest;
import com.Streaming.dto.request.UpdateWatchHistoryRequest;
import com.Streaming.dto.response.ContentResponse;
import com.Streaming.dto.response.UserResponse;
import com.Streaming.dto.response.WatchHistoryResponse;
import com.Streaming.service.UserAccountService;
import com.Streaming.shared.api.ApiMessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserAccountController {

    private final UserAccountService userAccountService;

    @GetMapping("/profile")
    public UserResponse getProfile(Authentication authentication) {
        return userAccountService.getProfile(authentication.getName());
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userAccountService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/change-password")
    public ApiMessageResponse changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userAccountService.changePassword(authentication.getName(), request);
        return new ApiMessageResponse("Contraseña actualizada");
    }

    @PostMapping("/request-verification")
    public ApiMessageResponse requestVerification(Authentication authentication) {
        String message = userAccountService.requestVerification(authentication.getName());
        return new ApiMessageResponse(message);
    }

    @GetMapping("/my-list")
    public List<ContentResponse> getMyList(Authentication authentication) {
        return userAccountService.getMyList(authentication.getName());
    }

    @PostMapping("/my-list/{contentId}")
    public ApiMessageResponse addToMyList(
            Authentication authentication,
            @PathVariable String contentId
    ) {
        userAccountService.addToMyList(authentication.getName(), contentId);
        return new ApiMessageResponse("Contenido agregado a tu lista");
    }

    @DeleteMapping("/my-list/{contentId}")
    public ApiMessageResponse removeFromMyList(
            Authentication authentication,
            @PathVariable String contentId
    ) {
        userAccountService.removeFromMyList(authentication.getName(), contentId);
        return new ApiMessageResponse("Contenido eliminado de tu lista");
    }

    @GetMapping("/history")
    public List<WatchHistoryResponse> getHistory(Authentication authentication) {
        return userAccountService.getHistory(authentication.getName());
    }

    @PutMapping("/history/{contentId}")
    public WatchHistoryResponse updateHistory(
            Authentication authentication,
            @PathVariable String contentId,
            @Valid @RequestBody UpdateWatchHistoryRequest request
    ) {
        return userAccountService.updateHistory(authentication.getName(), contentId, request);
    }

    @GetMapping("/continue-watching")
    public List<WatchHistoryResponse> getContinueWatching(Authentication authentication) {
        return userAccountService.getContinueWatching(authentication.getName());
    }
}
