package com.Streaming.dto.response;

import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String avatarUrl;
    private Role role;
    private boolean emailVerified;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserResponse(User user) {
        this.id = user.getId(); // 👈 STRING (UUID)
        this.name = user.getName();
        this.email = user.getEmail();
        this.avatarUrl = user.getAvatarUrl();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
        this.active = user.isActive();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }
}
