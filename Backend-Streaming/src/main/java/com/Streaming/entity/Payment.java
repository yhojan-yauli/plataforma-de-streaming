package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne
    private User user;

    @ManyToOne
    private Subscription subscription;

    @ManyToOne
    private SubscriptionPlan plan;

    private Double amount;

    @Builder.Default
    private String currency = "PEN";


    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String provider;

    private String providerMethod;

    @Column(unique = true)
    private String externalId;

    private String externalStatus;

    private String externalStatusDetail;

    @Column(unique = true)
    private String externalReference;

    @Column(unique = true)
    private String idempotencyKey;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void touchUpdatedAt() {
        updatedAt = LocalDateTime.now();
    }
}
