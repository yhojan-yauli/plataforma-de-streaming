package com.Streaming.repository;

import com.Streaming.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    // 🔹 Ingresos del mes
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE MONTH(p.createdAt) = :month AND YEAR(p.createdAt) = :year")
    double getMonthlyRevenue(int month, int year);

    @Query(value = """
SELECT MONTH(created_at) as month, SUM(amount) as revenue
FROM payment
WHERE YEAR(created_at) = :year
GROUP BY MONTH(created_at)
ORDER BY MONTH(created_at)
""", nativeQuery = true)
    List<Object[]> getRevenueRaw(int year);
}