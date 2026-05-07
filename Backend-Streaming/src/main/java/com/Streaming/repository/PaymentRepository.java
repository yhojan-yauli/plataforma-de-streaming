package com.Streaming.repository;

import com.Streaming.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    @Query(value = """
SELECT COALESCE(SUM(amount), 0)
FROM payments
WHERE status = 'SUCCESS'
  AND MONTH(created_at) = :month
  AND YEAR(created_at) = :year
""", nativeQuery = true)
    double getMonthlyRevenue(int month, int year);

    @Query(value = """
SELECT MONTH(created_at) as month, SUM(amount) as revenue
FROM payments
WHERE status = 'SUCCESS' AND YEAR(created_at) = :year
GROUP BY MONTH(created_at)
ORDER BY MONTH(created_at)
""", nativeQuery = true)
    List<Object[]> getRevenueRaw(int year);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<Payment> findByExternalId(String externalId);

    Optional<Payment> findByExternalReference(String externalReference);
}
