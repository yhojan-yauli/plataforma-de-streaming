package com.Streaming.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private boolean active = true;

    // Relación MANY TO MANY con Content
    @ManyToMany
    @JoinTable(
            name = "category_content",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "content_id")
    )
    private List<Content> contents;
}
