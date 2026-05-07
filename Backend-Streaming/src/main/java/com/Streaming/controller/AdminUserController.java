package com.Streaming.controller;

import com.Streaming.dto.response.UserResponse;
import com.Streaming.service.UserService;
import com.Streaming.shared.api.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public PageResponse<UserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "La página no puede ser negativa") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "El tamaño debe ser mayor a 0") @Max(value = 100, message = "El tamaño máximo es 100") int size
    ) {
        return PageResponse.from(userService.getUsers(search, page, size));
    }

    @PutMapping("/{id}/status")
    public void toggleUser(@PathVariable String id) {
        userService.toggleUser(id);
    }
}
