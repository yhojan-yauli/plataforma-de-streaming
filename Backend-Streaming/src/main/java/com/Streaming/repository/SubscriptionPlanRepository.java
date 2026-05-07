package com.Streaming.repository;

import com.Streaming.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, String> {

    List<SubscriptionPlan> findByActiveTrueOrderByMonthsAsc();

    Optional<SubscriptionPlan> findByIdAndActiveTrue(String id);

    Optional<SubscriptionPlan> findByTypeAndActiveTrue(String type);
}
