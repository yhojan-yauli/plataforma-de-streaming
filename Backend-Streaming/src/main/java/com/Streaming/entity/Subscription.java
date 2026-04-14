package com.Streaming.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    private String id;

    @PrePersist
    public void generateId() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    @ManyToOne
    private User user;

    @ManyToOne
    private SubscriptionPlan plan;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Builder.Default
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Double amountPaid;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
