package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ContentResponse {

    private String id;
    private String title;
    private String description;
    private String type;
    private List<String> genre;

    private Integer year;
    private Integer duration;

    private Double rating;
    private Integer views;

    private boolean active;

    private String posterUrl;
    private String bannerUrl;
    private String videoUrl;
    private String trailerUrl;

    private LocalDateTime createdAt;
}
