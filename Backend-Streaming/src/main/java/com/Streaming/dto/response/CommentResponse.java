package com.Streaming.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private String id;
    private String userId;
    private String userName;
    private String userAvatar;
    private String contentId;
    private String text;
    private Integer rating;
    private boolean positive;
    private LocalDateTime createdAt;
}
