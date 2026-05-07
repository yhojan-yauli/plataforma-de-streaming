package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WatchHistoryResponse {

    private String id;
    private String contentId;
    private String episodeId;
    private ContentResponse content;
    private Integer progress;
    private LocalDateTime lastWatched;
}
