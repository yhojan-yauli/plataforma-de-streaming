package com.Streaming.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stripe_webhook_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeWebhookEvent {

    @Id
    private String id;

    private String type;

    private String paymentId;

    private String paymentExternalId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private StripeWebhookEventStatus status = StripeWebhookEventStatus.PROCESSING;

    @Builder.Default
    private Integer attemptCount = 0;

    private LocalDateTime eventCreatedAt;

    @Builder.Default
    private LocalDateTime receivedAt = LocalDateTime.now();

    private LocalDateTime processedAt;

    private LocalDateTime updatedAt;

    @Lob
    private String payload;

    private String lastError;

    @PreUpdate
    public void touchUpdatedAt() {
        updatedAt = LocalDateTime.now();
    }
}
