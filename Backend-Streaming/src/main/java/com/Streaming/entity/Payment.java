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

    private Double amount;

    @Builder.Default
    private String currency = "PEN";


    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;


    private String externalId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
