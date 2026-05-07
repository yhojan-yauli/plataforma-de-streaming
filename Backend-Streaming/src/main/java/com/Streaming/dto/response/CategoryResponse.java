package com.Streaming.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record CategoryResponse(
        String id,
        String name,
        List<ContentResponse> contents
) {
}
