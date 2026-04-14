package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne
    private User user;

    @ManyToOne
    private Content content;

    @Column(columnDefinition = "TEXT")
    private String text;

    private Integer rating;

    private boolean positive;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
