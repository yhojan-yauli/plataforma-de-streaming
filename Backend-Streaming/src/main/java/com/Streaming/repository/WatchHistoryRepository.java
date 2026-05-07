package com.Streaming.repository;

import com.Streaming.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, String> {

    List<WatchHistory> findByUserIdOrderByLastWatchedDesc(String userId);

    List<WatchHistory> findByUserIdAndProgressGreaterThanAndProgressLessThanOrderByLastWatchedDesc(
            String userId,
            Integer minProgress,
            Integer maxProgress
    );

    @Query("""
            SELECT wh
            FROM WatchHistory wh
            WHERE wh.user.id = :userId
              AND wh.content.id = :contentId
              AND ((:episodeId IS NULL AND wh.episode IS NULL) OR wh.episode.id = :episodeId)
            """)
    Optional<WatchHistory> findEntry(
            @Param("userId") String userId,
            @Param("contentId") String contentId,
            @Param("episodeId") String episodeId
    );
}
