package com.Streaming.repository;

import com.Streaming.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    long countByActiveTrue();
}