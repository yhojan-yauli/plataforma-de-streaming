package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EpisodeResponse {

    private String id;
    private String seriesId;
    private Integer season;
    private Integer episode;
    private String title;
    private String description;
    private Integer duration;
    private String videoUrl;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
}
