package com.Streaming.repository;

import com.Streaming.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, String> {

    Optional<Rating> findByUserIdAndContentId(String userId, String contentId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Rating r WHERE r.content.id = :contentId")
    Double getAverageRatingByContentId(@Param("contentId") String contentId);
}
