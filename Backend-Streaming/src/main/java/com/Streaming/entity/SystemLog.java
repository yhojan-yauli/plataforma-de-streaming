package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.boot.logging.LogLevel;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @Column(nullable = false)
    private String action;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private LogLevel level = LogLevel.INFO;

    private String ipAddress;

    private String userAgent;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
