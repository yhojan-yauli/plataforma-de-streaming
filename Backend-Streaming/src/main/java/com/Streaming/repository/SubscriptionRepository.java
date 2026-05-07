package com.Streaming.repository;

import com.Streaming.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    long countByActiveTrue();

    long countByActiveTrueAndEndDateAfter(LocalDateTime dateTime);

    Optional<Subscription> findFirstByUserIdAndActiveTrueOrderByEndDateDesc(String userId);
}
