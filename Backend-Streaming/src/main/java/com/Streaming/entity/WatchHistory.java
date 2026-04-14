package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "watch_history",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "content_id", "episode_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchHistory {

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

    @ManyToOne
    @JoinColumn(name = "episode_id")
    private Episode episode;

    // progreso en %
    @Builder.Default
    private Integer progress = 0;

    @Builder.Default
    private LocalDateTime lastWatched = LocalDateTime.now();
}
