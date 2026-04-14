package com.Streaming.dto.request;

import lombok.Data;

@Data
public class ContentRequest {

    private String title;
    private String description;
    private String type; // "MOVIE" o "SERIES"
    private String genre; // JSON string
    private Integer year;
    private Integer duration;

    private String posterUrl;
    private String bannerUrl;
    private String videoUrl;
    private String trailerUrl;
}