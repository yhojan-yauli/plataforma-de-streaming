package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ContentType type;

    @Column(columnDefinition = "JSON")
    private String genre;

    private Integer year;

    private Integer duration;

    @Builder.Default
    private Double rating = 0.0;

    private String posterUrl;
    private String bannerUrl;
    private String videoUrl;
    private String trailerUrl;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private Integer views = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();


    private LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "contents")
    private List<Category> categories;
}