package com.Streaming.repository;

import com.Streaming.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EpisodeRepository extends JpaRepository<Episode, String> {

    List<Episode> findByContentIdOrderBySeasonAscEpisodeAsc(String contentId);

    List<Episode> findByContentIdAndSeasonOrderByEpisodeAsc(String contentId, Integer season);

    Optional<Episode> findByIdAndContentId(String id, String contentId);
}
