package com.Streaming.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "episodes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Episode {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne
    @JoinColumn(name = "series_id")
    private Content content;

    private Integer season;
    private Integer episode;

    private String title;

    private String description;

    private Integer duration;

    private String videoUrl;

    private String thumbnailUrl;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}