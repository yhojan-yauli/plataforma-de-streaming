package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_my_list",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "content_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMyList {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "content_id")
    private Content content;

    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();
}
