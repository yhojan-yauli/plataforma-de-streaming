package com.Streaming.controller;

import com.Streaming.dto.response.UserResponse;
import com.Streaming.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    // 🔹 GET USERS
    @GetMapping
    public Page<UserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getUsers(search, page, size);
    }

    // 🔹 TOGGLE
    @PutMapping("/{id}/status")
    public void toggleUser(@PathVariable String id) {
        userService.toggleUser(id);
    }
}